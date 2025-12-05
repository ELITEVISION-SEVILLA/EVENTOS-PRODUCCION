
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Clapperboard,
  Contact,
  Cloud,
  CloudOff,
  Database,
  Save,
  Trash2,
  Upload,
  LogOut,
  Shield,
  RefreshCw,
  HardDrive,
  FileUp // New icon for Excel upload
} from 'lucide-react';

// Imported with .tsx extension to fix module resolution issues in Vercel/CI
import { ProductionView } from './components/ProductionViewComponent.tsx';
import { AdminView } from './components/AdminViewComponent.tsx';
import { StatsView } from './components/StatsViewComponent.tsx';
import { StaffView } from './components/StaffViewComponent.tsx';
import { CreateEventModal } from './components/CreateEventModalComponent.tsx';
import { LoginComponent } from './components/LoginComponent.tsx';
import { UsersView } from './components/UsersViewComponent.tsx';

// Import mock data directly for the seeding function
import { EVENTS_DATA, STAFF_DATA, USERS_DATA } from './mockData';
import { ProductionEvent, StaffMember, AppUser, generateId, PaymentType } from './types';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';

// XLSX import
import * as XLSX from 'xlsx';

type View = 'PRODUCTION' | 'ADMIN' | 'STATS' | 'STAFF' | 'SETTINGS' | 'USERS';

function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // View State
  const [currentView, setCurrentView] = useState<View>('PRODUCTION');
  
  // Cloud State
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');

  // Data State
  const [events, setEvents] = useState<ProductionEvent[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  // Auto-Save State
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Excel Upload State
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadFileMessage, setUploadFileMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Refs for Auto-Save (to access current state inside interval)
  const eventsRef = useRef(events);
  const staffRef = useRef(staff);
  const usersRef = useRef(users);

  // Update refs when state changes
  useEffect(() => {
    eventsRef.current = events;
    staffRef.current = staff;
    usersRef.current = users;
  }, [events, staff, users]);
  
  // --- INITIALIZATION LOGIC ---

  useEffect(() => {
    // 1. Load Session
    const storedUser = localStorage.getItem('elitevision_session');
    if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
    }

    const checkCloud = async () => {
        const storedConfig = localStorage.getItem('elitevision_firebase_config');
        
        // 2. Try to connect to Cloud
        if (storedConfig) {
            try {
                setCloudStatus('CONNECTING');
                const config = JSON.parse(storedConfig);
                const app = initializeApp(config);
                const db = getFirestore(app);
                setDbInstance(db);
                setIsCloudConfigured(true);
                setCloudStatus('CONNECTED');
                setFirebaseConfigInput(JSON.stringify(config, null, 2));

                // SUBSCRIBE TO CLOUD DATA
                // Events Listener
                onSnapshot(collection(db, 'events'), (snapshot) => {
                    const loadedEvents = snapshot.docs.map(doc => doc.data() as ProductionEvent);
                    setEvents(loadedEvents);
                });

                // Staff Listener
                onSnapshot(collection(db, 'staff'), (snapshot) => {
                    const loadedStaff = snapshot.docs.map(doc => doc.data() as StaffMember);
                    setStaff(loadedStaff);
                });

                // Users Listener
                onSnapshot(collection(db, 'users'), (snapshot) => {
                    const loadedUsers = snapshot.docs.map(doc => doc.data() as AppUser);
                    // Ensure at least one admin exists if cloud is empty (bootstrap)
                    if (loadedUsers.length === 0) {
                        setUsers(USERS_DATA);
                    } else {
                        setUsers(loadedUsers);
                    }
                });

            } catch (error) {
                console.error("Firebase Connection Error", error);
                setCloudStatus('ERROR');
                loadLocalData(); // Fallback
            }
        } else {
            // 3. No Cloud Config -> Load Local Data
            loadLocalData();
        }
    };

    checkCloud();
  }, []); // Run once on mount

  // --- AUTO-SAVE INTERVAL ---
  useEffect(() => {
    if (!currentUser) return;

    // Run every 5 minutes (300,000 ms)
    const intervalId = setInterval(() => {
      console.log("Ejecutando auto-guardado de seguridad...");
      
      const backupData = {
        events: eventsRef.current,
        staff: staffRef.current,
        users: usersRef.current,
        timestamp: new Date().toISOString(),
        version: '3.1 Beta' // Updated version for auto-save
      };
      
      try {
        localStorage.setItem('elitevision_autosave_backup', JSON.stringify(backupData));
        setLastAutoSave(new Date());
      } catch (e) {
        console.error("Error en auto-guardado", e);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const loadLocalData = () => {
    const savedEvents = localStorage.getItem('elitevision_events');
    // Fix: Used EVENTS_DATA as default if no local data
    setEvents(savedEvents ? JSON.parse(savedEvents) : EVENTS_DATA);

    const savedStaff = localStorage.getItem('elitevision_staff');
    setStaff(savedStaff ? JSON.parse(savedStaff) : STAFF_DATA);

    const savedUsers = localStorage.getItem('elitevision_users');
    setUsers(savedUsers ? JSON.parse(savedUsers) : USERS_DATA);
  };

  // --- PERSISTENCE HANDLERS (Hybrid: Cloud or Local) ---

  // Auth Handlers
  const handleLogin = (user: AppUser) => {
      setCurrentUser(user);
      localStorage.setItem('elitevision_session', JSON.stringify(user));
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('elitevision_session');
      setCurrentView('PRODUCTION'); // Reset view
  };

  // Save Event (Create or Update)
  const handleCreateOrUpdateEvent = async (savedEvent: ProductionEvent) => {
    if (isCloudConfigured && dbInstance) {
        // Cloud Save
        try {
            await setDoc(doc(dbInstance, 'events', savedEvent.id), savedEvent);
        } catch (e) {
            alert("Error guardando en la nube. Comprueba tu conexión.");
        }
    } else {
        // Local Save
        const newEvents = events.some(e => e.id === savedEvent.id)
            ? events.map(e => e.id === savedEvent.id ? savedEvent : e)
            : [...events, savedEvent];
        
        setEvents(newEvents);
        localStorage.setItem('elitevision_events', JSON.stringify(newEvents));
    }
    setEditingEvent(null);
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    if (isCloudConfigured && dbInstance) {
        try {
            await deleteDoc(doc(dbInstance, 'events', eventId));
        } catch (e) {
            alert("Error eliminando el evento en la nube. Comprueba tu conexión.");
        }
    } else {
        const newEvents = events.filter(e => e.id !== eventId);
        setEvents(newEvents);
        localStorage.setItem('elitevision_events', JSON.stringify(newEvents));
    }
  };

  // Update Specific Shift (Admin View)
  const handleUpdateShift = async (eventId: string, shiftId: string, updates: any) => {
    // Calculate new state first
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const updatedEvent = {
        ...targetEvent,
        shifts: targetEvent.shifts.map(shift => {
            if (shift.id !== shiftId) return shift;
            return { ...shift, ...updates };
        })
    };

    if (isCloudConfigured && dbInstance) {
        await setDoc(doc(dbInstance, 'events', eventId), updatedEvent);
    } else {
        const newEvents = events.map(e => e.id === eventId ? updatedEvent : e);
        setEvents(newEvents);
        localStorage.setItem('elitevision_events', JSON.stringify(newEvents));
    }
  };

  // Staff Handlers
  const handleAddStaff = async (newStaff: StaffMember) => {
    if (isCloudConfigured && dbInstance) {
        await setDoc(doc(dbInstance, 'staff', newStaff.id), newStaff);
    } else {
        const newStaffList = [...staff, newStaff];
        setStaff(newStaffList);
        localStorage.setItem('elitevision_staff', JSON.stringify(newStaffList));
    }
  };

  const handleUpdateStaff = async (updatedStaff: StaffMember) => {
    if (isCloudConfigured && dbInstance) {
        await setDoc(doc(dbInstance, 'staff', updatedStaff.id), updatedStaff);
    } else {
        const newStaffList = staff.map(s => s.id === updatedStaff.id ? updatedStaff : s);
        setStaff(newStaffList);
        localStorage.setItem('elitevision_staff', JSON.stringify(newStaffList));
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (isCloudConfigured && dbInstance) {
        await deleteDoc(doc(dbInstance, 'staff', id));
    } else {
        const newStaffList = staff.filter(s => s.id !== id);
        setStaff(newStaffList);
        localStorage.setItem('elitevision_staff', JSON.stringify(newStaffList));
    }
  };

  // User Handlers
  const handleAddUser = async (newUser: AppUser) => {
      if (isCloudConfigured && dbInstance) {
          await setDoc(doc(dbInstance, 'users', newUser.id), newUser);
      } else {
          const newUsersList = [...users, newUser];
          setUsers(newUsersList);
          localStorage.setItem('elitevision_users', JSON.stringify(newUsersList));
      }
  };

  const handleDeleteUser = async (id: string) => {
      if (isCloudConfigured && dbInstance) {
          await deleteDoc(doc(dbInstance, 'users', id));
      } else {
          const newUsersList = users.filter(u => u.id !== id);
          setUsers(newUsersList);
          localStorage.setItem('elitevision_users', JSON.stringify(newUsersList));
      }
  };

  // --- CLOUD SETUP UTILS ---
  const saveCloudConfig = () => {
      try {
          const config = JSON.parse(firebaseConfigInput);
          localStorage.setItem('elitevision_firebase_config', JSON.stringify(config));
          window.location.reload(); // Reload to initialize connection
      } catch (e) {
          alert("El formato JSON no es válido. Asegúrate de copiar todo el objeto de configuración de Firebase.");
      }
  };

  const disconnectCloud = () => {
      if(confirm("¿Desconectar de la nube? Volverás a usar los datos locales de este navegador.")) {
          localStorage.removeItem('elitevision_firebase_config');
          window.location.reload();
      }
  };

  const uploadLocalDataToCloud = async () => {
      if (!isCloudConfigured || !dbInstance) return;
      if (!confirm("Esto sobrescribirá los datos en la nube con los datos locales actuales de este navegador (Eventos, Personal y Usuarios). ¿Continuar?")) return;

      const batch = writeBatch(dbInstance);
      
      // Load local raw data from localStorage
      const localEvents = JSON.parse(localStorage.getItem('elitevision_events') || '[]');
      const localStaff = JSON.parse(localStorage.getItem('elitevision_staff') || '[]');
      const localUsers = JSON.parse(localStorage.getItem('elitevision_users') || '[]');

      localEvents.forEach((e: ProductionEvent) => {
          const ref = doc(dbInstance, 'events', e.id);
          batch.set(ref, e);
      });

      localStaff.forEach((s: StaffMember) => {
          const ref = doc(dbInstance, 'staff', s.id);
          batch.set(ref, s);
      });

      localUsers.forEach((u: AppUser) => {
          const ref = doc(dbInstance, 'users', u.id);
          batch.set(ref, u);
      });

      try {
          await batch.commit();
          alert("Sincronización completada: Datos locales subidos a la nube.");
      } catch (error) {
          console.error("Error al subir datos locales a la nube:", error);
          alert("Error al subir datos locales a la nube. Revisa la consola para más detalles.");
      }
  };

  const uploadLocalStaffToCloud = async () => {
      if (!isCloudConfigured || !dbInstance) return;
      if (!confirm("Esto sobrescribirá la base de datos de PERSONAL en la nube con los datos locales actuales de este navegador. ¿Continuar?")) return;

      const batch = writeBatch(dbInstance);
      const localStaff = JSON.parse(localStorage.getItem('elitevision_staff') || '[]');

      localStaff.forEach((s: StaffMember) => {
          const ref = doc(dbInstance, 'staff', s.id);
          batch.set(ref, s);
      });

      try {
          await batch.commit();
          alert("Sincronización de personal completada: Datos locales subidos a la nube.");
      } catch (error) {
          console.error("Error al subir personal local a la nube:", error);
          alert("Error al subir personal local a la nube. Revisa la consola para más detalles.");
      }
  };

  const uploadMockDataToCloud = async () => {
      if (!isCloudConfigured || !dbInstance) return;
      if (!confirm("¡Atención! Esto sobrescribirá *todos* los datos de Eventos, Personal y Usuarios en la nube con los datos de ejemplo predeterminados. ¿Continuar?")) return;

      const batch = writeBatch(dbInstance);
      
      // Use the mock data directly from the imports
      EVENTS_DATA.forEach((e: ProductionEvent) => {
          const ref = doc(dbInstance, 'events', e.id);
          batch.set(ref, e);
      });

      STAFF_DATA.forEach((s: StaffMember) => {
          const ref = doc(dbInstance, 'staff', s.id);
          batch.set(ref, s);
      });

      USERS_DATA.forEach((u: AppUser) => {
          const ref = doc(dbInstance, 'users', u.id);
          batch.set(ref, u);
      });

      try {
          await batch.commit();
          alert("Sincronización completada: Datos de ejemplo cargados a la nube.");
      } catch (error) {
          console.error("Error al cargar datos de ejemplo a la nube:", error);
          alert("Error al cargar datos de ejemplo a la nube. Revisa la consola para más detalles.");
      }
  };

  // --- NEW: EXCEL UPLOAD LOGIC ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          setSelectedExcelFile(event.target.files[0]);
          setUploadFileMessage(null); // Clear previous messages
      }
  };

  const parseExcelStaffFile = async (file: File): Promise<StaffMember[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Cast e.target?.result to ArrayBuffer since readAsArrayBuffer is used.
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const staffMembers: StaffMember[] = json.map((row: any) => {
            const normalizeHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, '');

            const getFieldValue = (possibleHeaders: string[]) => {
                for (const header of possibleHeaders) {
                    const normalizedHeader = normalizeHeader(header);
                    // Find the actual key in the row, case-insensitive and stripped of special chars
                    const actualKey = Object.keys(row).find(k => normalizeHeader(k) === normalizedHeader);
                    if (actualKey && row[actualKey] !== undefined && row[actualKey] !== null) {
                        return String(row[actualKey]).trim();
                    }
                }
                return undefined;
            };

            const firstName = getFieldValue(['Nombre', 'First Name', 'Primer Nombre']);
            const lastName = getFieldValue(['Apellidos', 'Last Name']);
            const dni = getFieldValue(['DNI', 'ID', 'Identificación']);
            const socialSecurityNumber = getFieldValue(['SS', 'Seguridad Social', 'Numero SS', 'Social Security Number']);
            const phone = getFieldValue(['Telefono', 'Phone', 'Movil']);
            const role = getFieldValue(['Puesto', 'Rol', 'Role']);
            const bankAccount = getFieldValue(['IBAN', 'Nº Cuenta', 'Cuenta Bancaria', 'Bank Account']);
            const email = getFieldValue(['Email', 'Correo']);
            const province = getFieldValue(['Provincia', 'Ubicacion', 'Province']);
            let paymentTypeRaw = getFieldValue(['Tipo de Pago', 'Estado', 'Forma de Pago']);
            const notes = getFieldValue(['Notas', 'Observaciones']);

            let paymentType: PaymentType = 'Unknown';
            if (paymentTypeRaw) {
                const lowerCasePaymentType = paymentTypeRaw.toLowerCase();
                if (lowerCasePaymentType.includes('cooperativa')) paymentType = 'Cooperativa';
                else if (lowerCasePaymentType.includes('factura')) paymentType = 'Factura';
                else if (lowerCasePaymentType.includes('alta seg. social') || lowerCasePaymentType.includes('alta seguridad social') || lowerCasePaymentType.includes('alta')) paymentType = 'Alta Seg. Social';
                else if (lowerCasePaymentType.includes('plantilla')) paymentType = 'Plantilla';
                else if (lowerCasePaymentType.includes('empresa')) paymentType = 'Empresa';
                else if (lowerCasePaymentType.includes('autonomo') || lowerCasePaymentType.includes('autónomo')) paymentType = 'Autonomo';
            }
            
            // Basic validation
            if (!firstName || !dni || !role) {
                console.warn('Skipping row due to missing required fields (Nombre, DNI, Rol):', row);
                return null; // Skip invalid rows
            }

            return {
              id: generateId(), // Firebase will use DNI as document ID later. This is a temporary ID.
              firstName: firstName,
              lastName: lastName || '', // Ensure it's a string
              dni: dni,
              socialSecurityNumber: socialSecurityNumber,
              phone: phone,
              role: role,
              bankAccount: bankAccount,
              email: email,
              province: province,
              paymentType: paymentType,
              notes: notes,
            };
          }).filter(Boolean) as StaffMember[]; // Filter out nulls from skipped rows

          resolve(staffMembers);
        } catch (error) {
          reject(new Error("Error al procesar el archivo Excel. Asegúrate de que es un archivo .xlsx válido."));
        }
      };
      reader.onerror = (error) => reject(new Error("Error al leer el archivo."));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUploadStaffExcel = async () => {
      if (!isCloudConfigured || !dbInstance || !selectedExcelFile) {
          setUploadFileMessage({ type: 'error', text: 'Firebase no está configurado o no se ha seleccionado ningún archivo.' });
          return;
      }

      if (!confirm(`¿Estás seguro de que quieres subir el personal desde "${selectedExcelFile.name}"? Esto agregará o actualizará registros en la nube.`)) {
          setUploadFileMessage({ type: 'info', text: 'Subida cancelada.' });
          return;
      }

      setIsUploadingFile(true);
      setUploadFileMessage({ type: 'info', text: 'Procesando archivo...' });

      try {
          const staffToUpload = await parseExcelStaffFile(selectedExcelFile);
          
          if (staffToUpload.length === 0) {
              setUploadFileMessage({ type: 'error', text: 'No se encontraron técnicos válidos en el archivo Excel.' });
              setIsUploadingFile(false);
              return;
          }

          setUploadFileMessage({ type: 'info', text: `Subiendo ${staffToUpload.length} técnicos a la nube...` });

          const batch = writeBatch(dbInstance);
          let uploadedCount = 0;
          let failedCount = 0;

          for (const staffMember of staffToUpload) {
            if (staffMember.dni) { // Use DNI as unique ID for document
              const docRef = doc(dbInstance, 'staff', staffMember.dni);
              batch.set(docRef, { ...staffMember, id: staffMember.dni }); // Ensure Firebase ID matches DNI
              uploadedCount++;
            } else {
              failedCount++;
              console.warn('Skipped staff member due to missing DNI for cloud upload:', staffMember);
            }
          }

          await batch.commit();
          setUploadFileMessage({ type: 'success', text: `¡Éxito! Se subieron ${uploadedCount} técnicos. ${failedCount > 0 ? `${failedCount} fallaron (DNI ausente).` : ''}` });
          setSelectedExcelFile(null); // Clear selected file
      } catch (error: any) {
          console.error("Error al subir el personal desde Excel:", error);
          setUploadFileMessage({ type: 'error', text: `Error al subir: ${error.message || 'Error desconocido'}` });
      } finally {
          setIsUploadingFile(false);
      }
  };


  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ProductionEvent | null>(null);

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: ProductionEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // --- RENDER ---

  if (!currentUser) {
      return <LoginComponent users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 font-sans selection:bg-yellow-500/30">
      
      {/* Create/Edit Event Modal */}
      {isModalOpen && (
        <CreateEventModal 
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }} 
          onSave={handleCreateOrUpdateEvent}
          initialEvent={editingEvent}
          staffList={staff}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 border-r border-zinc-900 bg-black flex flex-col fixed h-full z-10 transition-all duration-300">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-900">
          {/* Logo Brand Style: ELITE BOLD, VISION THIN */}
          <div className="flex items-center gap-2">
             <div className="bg-yellow-500 text-black p-1.5 rounded font-bold">EV</div>
             <span className="hidden lg:block text-xl tracking-wider text-white">
                <span className="font-extrabold">ELITE</span><span className="font-light opacity-90">VISION</span>
             </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
          
          <button 
            onClick={() => setCurrentView('PRODUCTION')}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group ${currentView === 'PRODUCTION' ? 'bg-zinc-900 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <LayoutDashboard size={22} className={currentView === 'PRODUCTION' ? "fill-yellow-500/10" : ""} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Producción</span>
          </button>

          <button 
            onClick={() => setCurrentView('STAFF')}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group ${currentView === 'STAFF' ? 'bg-zinc-900 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Contact size={22} className={currentView === 'STAFF' ? "fill-yellow-500/10" : ""} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Personal</span>
          </button>

          <button 
            onClick={() => setCurrentView('ADMIN')}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group ${currentView === 'ADMIN' ? 'bg-zinc-900 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Users size={22} className={currentView === 'ADMIN' ? "fill-yellow-500/10" : ""} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Administración</span>
          </button>

          <button 
            onClick={() => setCurrentView('STATS')}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group ${currentView === 'STATS' ? 'bg-zinc-900 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <BarChart3 size={22} className={currentView === 'STATS' ? "fill-yellow-500/10" : ""} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Estadísticas</span>
          </button>

          {/* Admin Only Section */}
          {currentUser.role === 'ADMIN' && (
              <div className="mt-4 pt-4 border-t border-zinc-900">
                  <div className="px-3 mb-2 text-[10px] uppercase font-bold text-zinc-600 tracking-widest hidden lg:block">Sistema</div>
                  <button 
                    onClick={() => setCurrentView('USERS')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group w-full ${currentView === 'USERS' ? 'bg-zinc-900 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
                  >
                    <Shield size={22} className={currentView === 'USERS' ? "fill-yellow-500/10" : ""} />
                    <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Usuarios</span>
                  </button>
              </div>
          )}

        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-zinc-900 space-y-2">
          <button 
            onClick={() => setCurrentView('SETTINGS')}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-md transition-colors ${currentView === 'SETTINGS' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
          >
            <Settings size={22} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Configuración</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-md transition-colors text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
          >
            <LogOut size={22} />
            <span className="hidden lg:block font-medium uppercase text-xs tracking-wider">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="flex items-center text-zinc-500 text-sm">
                <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded text-xs border border-yellow-500/20 mr-2 uppercase tracking-wider font-bold">
                  v3.1 Beta
                </span>
             </div>
             
             {/* Cloud Status Indicator */}
             <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                 isCloudConfigured 
                 ? 'bg-zinc-900 border-zinc-800 text-zinc-400' 
                 : 'bg-zinc-900 border-zinc-800 text-zinc-500'
             }`}>
                {isCloudConfigured ? <Cloud size={14} className="text-yellow-500"/> : <CloudOff size={14} />}
                <span>{isCloudConfigured ? 'SINCRONIZADO' : 'LOCAL'}</span>
             </div>

             {/* Auto Save Status */}
             {lastAutoSave && (
                <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-600">
                    <HardDrive size={12} className="text-zinc-600" />
                    <span>Guardado auto: {lastAutoSave.toLocaleTimeString()}</span>
                </div>
             )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 w-64 transition-all placeholder:text-zinc-600"
              />
            </div>
            
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-white uppercase">{currentUser.name}</div>
                    <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{currentUser.role}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-yellow-500 font-bold">
                    {currentUser.name.charAt(0)}
                </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {currentView === 'PRODUCTION' && (
            <ProductionView 
              events={events} 
              onCreateEvent={openCreateModal}
              onEditEvent={openEditModal}
              onDeleteEvent={handleDeleteEvent} // Pass the new handler
              staffList={staff} 
            />
          )}
          {currentView === 'STAFF' && (
            <StaffView 
              staffList={staff}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
          {currentView === 'ADMIN' && (
            <AdminView 
              events={events} 
              staffList={staff}
              onUpdateShift={handleUpdateShift}
            />
          )}
          {currentView === 'STATS' && <StatsView events={events} />}
          
          {currentView === 'USERS' && currentUser.role === 'ADMIN' && (
              <UsersView 
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                currentUser={currentUser}
              />
          )}
          
          {currentView === 'SETTINGS' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b border-zinc-800 pb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 uppercase">
                        <Database className="text-yellow-500" />
                        Base de Datos
                    </h2>
                    <p className="text-zinc-500 mt-2">
                        Configuración de sincronización con Google Firebase.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Connection Panel */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            {isCloudConfigured ? <Cloud className="text-yellow-500"/> : <CloudOff className="text-zinc-500"/>}
                            Estado de la Conexión
                        </h3>
                        
                        {isCloudConfigured ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-3 text-yellow-500">
                                    <Cloud size={24} />
                                    <div>
                                        <div className="font-bold">Conectado a Google Firebase</div>
                                        <div className="text-sm text-zinc-400">Tus datos se guardan en la nube en tiempo real.</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {/* Existing Upload All Data Button */}
                                    <button 
                                        onClick={uploadLocalDataToCloud}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-200 transition-colors border border-zinc-700 justify-center"
                                    >
                                        <Upload size={16} /> Subir todos los datos locales a la nube
                                    </button>
                                    {/* Existing: Upload Local Staff Data Button */}
                                    <button 
                                        onClick={uploadLocalStaffToCloud}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-200 transition-colors border border-zinc-700 justify-center"
                                    >
                                        <Upload size={16} /> Subir Personal Local a la Nube
                                    </button>

                                    {/* NEW: Upload Staff from Excel */}
                                    <div className="mt-6 pt-4 border-t border-zinc-800">
                                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FileUp size={14} className="text-green-500"/>
                                            Subir Personal desde Excel
                                        </h4>
                                        <p className="text-xs text-zinc-500 mb-3">
                                            Selecciona un archivo .xlsx para agregar o actualizar el personal en la nube.
                                            (Encabezados esperados: "Nombre", "Apellidos", "DNI", "Puesto", "Tipo de Pago", etc.)
                                        </p>
                                        <input 
                                            type="file" 
                                            accept=".xlsx" 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                            id="excel-upload-input" 
                                            disabled={isUploadingFile}
                                        />
                                        <label 
                                            htmlFor="excel-upload-input" 
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                                                isUploadingFile ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                            }`}
                                        >
                                            {isUploadingFile ? 'Cargando...' : selectedExcelFile ? selectedExcelFile.name : 'Seleccionar archivo Excel'}
                                        </label>
                                        {selectedExcelFile && !isUploadingFile && (
                                            <button 
                                                onClick={handleUploadStaffExcel}
                                                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded text-sm shadow-lg shadow-yellow-900/20 transition-colors"
                                            >
                                                <Upload size={16} /> Procesar y Subir
                                            </button>
                                        )}
                                        {uploadFileMessage && (
                                            <div className={`mt-3 p-3 rounded text-xs flex items-center gap-2 ${
                                                uploadFileMessage.type === 'success' ? 'bg-green-950/20 text-green-400 border border-green-900/30' :
                                                uploadFileMessage.type === 'error' ? 'bg-red-950/20 text-red-400 border border-red-900/30' :
                                                'bg-blue-950/20 text-blue-400 border border-blue-900/30'
                                            }`}>
                                                {uploadFileMessage.text}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Existing Mock Data and Disconnect buttons */}
                                    <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-4">
                                        <button 
                                            onClick={uploadMockDataToCloud}
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-950/20 hover:bg-yellow-950/30 text-yellow-400 rounded text-sm transition-colors border border-yellow-900/30 justify-center"
                                        >
                                            <RefreshCw size={16} /> Cargar datos de ejemplo a la nube
                                        </button>
                                        <button 
                                            onClick={disconnectCloud}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/30 text-red-400 rounded text-sm transition-colors border border-red-900/30 justify-center"
                                        >
                                            <Trash2 size={16} /> Desconectar de la nube
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Pega aquí el objeto de configuración de tu proyecto de Firebase.
                                </p>
                                <textarea 
                                    value={firebaseConfigInput}
                                    onChange={(e) => setFirebaseConfigInput(e.target.value)}
                                    placeholder='{ "apiKey": "...", "authDomain": "...", "projectId": "...", "storageBucket": "...", "messagingSenderId": "...", "appId": "..." }'
                                    className="w-full h-48 bg-black border border-zinc-800 rounded p-3 font-mono text-xs text-zinc-300 focus:border-yellow-500 focus:outline-none"
                                />
                                <p className="text-xs text-zinc-600 mt-1">
                                    <span className="font-bold text-yellow-500">Importante:</span> Pega solo el objeto JSON (lo que está entre llaves <code className="bg-zinc-800 text-zinc-300 px-1 rounded">{'{...}'}</code>), no la declaración de la variable <code className="bg-zinc-800 text-zinc-300 px-1 rounded">const firebaseConfig =</code>.
                                </p>
                                <button 
                                    onClick={saveCloudConfig}
                                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                >
                                    <Save size={18} /> Guardar y Conectar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Instructions Panel */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                            <h4 className="font-bold text-white mb-2">Instrucciones</h4>
                            <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-2">
                                <li>Ve a <a href="https://console.firebase.google.com/" target="_blank" className="text-yellow-500 hover:underline">console.firebase.google.com</a></li>
                                <li>Crea un nuevo proyecto.</li>
                                <li>Añade una app "Web".</li>
                                <li>Copia el <code>const firebaseConfig = {'{...}'}</code>.</li>
                                <li>Pégalo en el cuadro de la izquierda.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default App;
