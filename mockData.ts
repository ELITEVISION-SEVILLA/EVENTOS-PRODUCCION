
import { ProductionEvent, StaffMember, AppUser } from './types';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

export const USERS_DATA: AppUser[] = [
  {
    id: 'admin-001',
    username: 'administracion',
    password: 'NuevaElite25', // Default credentials as requested
    name: 'Administrador Principal',
    role: 'ADMIN'
  }
];

export const STAFF_DATA: StaffMember[] = [
  { id: uid(), lastName: 'Amaral Espadas', firstName: 'Daniel', dni: '75138300Z', socialSecurityNumber: '', phone: '635489400', role: 'Realizador', bankAccount: 'ES1101826443770201526988', email: 'amaralmedia@gmail.com', province: 'Granada', paymentType: 'Autonomo', notes: '' },
  { id: uid(), lastName: 'Berraquero Albiol', firstName: 'Borja', dni: '53932693Q', socialSecurityNumber: '411086709918', phone: '653959406', role: 'Aux.Sonido', bankAccount: 'ES3331870816694434944718', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Blasco Rodríguez', firstName: 'Francisco', dni: '14634327W', socialSecurityNumber: '', phone: '616628335', role: 'Repeticiones', bankAccount: '', email: 'pacoblasco@dibere.com', province: 'Sevilla', paymentType: 'Empresa', notes: '' },
  { id: uid(), lastName: 'Damian Pereira', firstName: 'Brian', dni: 'Z2334216C', socialSecurityNumber: '', phone: '697668552', role: 'Becario', bankAccount: '', email: '', province: '', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'De la Cruz Regueira', firstName: 'Ana Maria', dni: '53965931L', socialSecurityNumber: '411081348646', phone: '697203104', role: 'Aux.Camara', bankAccount: 'ES8800815493870001068816', email: 'anamdlcr@hotmail.com', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: 'Curso de Mochila' },
  { id: uid(), lastName: 'Grande Martínez', firstName: 'Juan Carlos', dni: '77924999X', socialSecurityNumber: '', phone: '633948171', role: 'Ope.Camara DSLR', bankAccount: 'ES2100494616462190003084', email: 'juancarlosgrandem@gmail.com', province: 'Sevilla', paymentType: 'Autonomo', notes: '' },
  { id: uid(), lastName: 'Losquiño Fuentes', firstName: 'Juan Jose', dni: '45812329D', socialSecurityNumber: '411078828262', phone: '6583133572', role: 'Auxiliar', bankAccount: 'ES6321007796770100081089', email: 'juanjoselosquinofuentes@gmail.com', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Martinez Valiente', firstName: 'Jose Miguel', dni: '28484192A', socialSecurityNumber: '', phone: '651040552', role: 'Realizador', bankAccount: '', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Palacios Japon', firstName: 'Jose Matias', dni: '', socialSecurityNumber: '411017894882', phone: '675973224', role: 'Ope.Camara', bankAccount: '', email: 'jmatiaspj@gmail.com', province: 'Sevilla', paymentType: 'Autonomo', notes: 'Curso de Mochila' },
  { id: uid(), lastName: 'Perez Gago', firstName: 'Jose Carlos', dni: '48817282N', socialSecurityNumber: '411035968006', phone: '635960871', role: 'Ope.Camara', bankAccount: 'ES2401826001410201509587', email: 'jcperago@gmail.com', province: 'Sevilla', paymentType: 'Autonomo', notes: '' },
  { id: uid(), lastName: 'Rivera Perez', firstName: 'Andrea', dni: '28828563H', socialSecurityNumber: '411085808222', phone: '606928989', role: 'Figurante Video', bankAccount: 'ES5221006625610200021230', email: 'riverandrea@outlook.es', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Rodriguez', firstName: 'Laura Maria', dni: '48974573Y', socialSecurityNumber: '410200016133', phone: '645339116', role: 'Unknown', bankAccount: '', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Rodriguez Guisasola', firstName: 'Abraham', dni: '47265001R', socialSecurityNumber: '411110104601', phone: '622377616', role: 'Ope.Camara', bankAccount: 'ES7731870105911393785413', email: 'abraham.ro.gui@outlook.es', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Romero Nuñez', firstName: 'Luis', dni: '77859991T', socialSecurityNumber: '411057801187', phone: '626776903', role: 'Ope.Camara', bankAccount: 'ES5500730100530589390142', email: 'luisromnun@gmail.com', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Ropero Gil', firstName: 'Ivan', dni: '30216323G', socialSecurityNumber: '411065521983', phone: '654072072', role: 'Ope.Camara', bankAccount: 'ES1621007651100100053765', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Santos Muñoz', firstName: 'Sebastian', dni: '29510565R', socialSecurityNumber: '411052427993', phone: '677733646', role: 'Aux. Sonido', bankAccount: 'ES1501825332190203101806', email: 'santos.munoz.sebastian@gmail.com', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Segura López', firstName: 'Fernando', dni: '28782974S', socialSecurityNumber: '411042640390', phone: '615920261', role: 'Unknown', bankAccount: '', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Vega Meneses', firstName: 'Fernando Carlos', dni: '77590890E', socialSecurityNumber: '411034382256', phone: '657056757', role: 'Fotografo', bankAccount: 'ES5921007822132100042868', email: '', province: 'Sevilla', paymentType: 'Alta Seg. Social', notes: '' },
  { id: uid(), lastName: 'Acal Olivencia', firstName: 'Inmaculada', dni: '12345678A', role: 'Unknown', paymentType: 'Autonomo', socialSecurityNumber: '', phone: '', bankAccount: '', email: '', province: '', notes: '' },
];

// Mock data for production events
export const EVENTS_DATA: ProductionEvent[] = [
  {
    id: uid(),
    title: 'Gala de Premios Anual',
    date: '2024-03-15',
    shifts: [
      {
        id: uid(),
        eventId: '',
        role: 'Jefe Técnico',
        personName: 'Borja Berraquero Albiol',
        dni: '53932693Q',
        socialSecurity: true,
        agreedSalary: 300,
        paymentType: 'Alta Seg. Social',
        schedule: 'Completa',
        socialSecurityStartDate: '2024-03-14',
        socialSecurityEndDate: '2024-03-16',
      },
      {
        id: uid(),
        eventId: '',
        role: 'Operador de Cámara',
        personName: 'Daniel Amaral Espadas',
        dni: '75138300Z',
        socialSecurity: false,
        agreedSalary: 250,
        paymentType: 'Autonomo',
        schedule: 'Completa',
      },
      {
        id: uid(),
        eventId: '',
        role: 'Auxiliar de Sonido',
        personName: 'Sebastian Santos Muñoz',
        dni: '29510565R',
        socialSecurity: true,
        agreedSalary: 200,
        paymentType: 'Alta Seg. Social',
        schedule: 'Completa',
        socialSecurityStartDate: '2024-03-15',
        socialSecurityEndDate: '2024-03-15',
      },
    ],
  },
  {
    id: uid(),
    title: 'Concierto de Verano',
    date: '2024-07-22',
    shifts: [
      {
        id: uid(),
        eventId: '',
        role: 'Realizador',
        personName: 'Jose Miguel Martinez Valiente',
        dni: '28484192A',
        socialSecurity: true,
        agreedSalary: 350,
        paymentType: 'Alta Seg. Social',
        schedule: 'Completa',
        socialSecurityStartDate: '2024-07-21',
        socialSecurityEndDate: '2024-07-23',
      },
      {
        id: uid(),
        eventId: '',
        role: 'Operador de Cámara',
        personName: 'Juan Carlos Grande Martínez',
        dni: '77924999X',
        socialSecurity: false,
        agreedSalary: 280,
        paymentType: 'Autonomo',
        schedule: 'Completa',
      },
      {
        id: uid(),
        eventId: '',
        role: 'Auxiliar',
        personName: 'Ivan Ropero Gil',
        dni: '30216323G',
        socialSecurity: true,
        agreedSalary: 180,
        paymentType: 'Alta Seg. Social',
        schedule: 'Media',
        socialSecurityStartDate: '2024-07-22',
        socialSecurityEndDate: '2024-07-22',
      },
    ],
  },
  {
    id: uid(),
    title: 'Grabación Corporativa',
    date: '2024-05-01',
    shifts: [
      {
        id: uid(),
        eventId: '',
        role: 'Operador de Cámara',
        personName: 'Abraham Rodriguez Guisasola',
        dni: '47265001R',
        socialSecurity: true,
        agreedSalary: 250,
        paymentType: 'Alta Seg. Social',
        schedule: 'Completa',
        socialSecurityStartDate: '2024-05-01',
        socialSecurityEndDate: '2024-05-01',
      },
      {
        id: uid(),
        eventId: '',
        role: 'Asistente de Producción',
        personName: 'Ana Maria De la Cruz Regueira',
        dni: '53965931L',
        socialSecurity: true,
        agreedSalary: 150,
        paymentType: 'Alta Seg. Social',
        schedule: 'Media',
        socialSecurityStartDate: '2024-05-01',
        socialSecurityEndDate: '2024-05-01',
      },
    ],
  },
];
