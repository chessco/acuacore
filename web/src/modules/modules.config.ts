import { 
  MessageSquare, 
  Layout, 
  Database, 
  BarChart3, 
  Users, 
  Zap,
  Settings,
  BookOpen,
  Cpu,
  ShieldCheck,
  MessageSquareQuote,
  TrendingUp,
  FileText,
  Eye,
  LayoutDashboard,
  Package
} from 'lucide-react';
import { Inbox } from './inbox/Inbox';
import { KnowledgeBase } from './knowledge/KnowledgeBase';
import { Analytics } from './analytics/Analytics';
import { AgentsManager } from './agents/AgentsManager';
import { SkillsManager } from './skills/SkillsManager';
import { UserManager } from './users/UserManager';
import { HITL } from './hitl/HITL';
import { CorrectionsManager } from './corrections/CorrectionsManager';
import { TenantManager } from './tenants/TenantManager';
import { PredictiveHub } from './predictive/PredictiveHub';
import { ProtocolArchitecture } from './protocols/ProtocolArchitecture';
import { VisionLab } from './vision/VisionLab';
import { ProductsManager } from './ecommerce/ProductsManager';
import { OrdersManager } from './ecommerce/OrdersManager';
import { ModuleManager } from './system/ModuleManager';

export interface ModuleConfig {
  id: string;           
  label: string;        
  icon: any;            
  component: any;       
  description: string;  
  category: 'operativo' | 'gestion' | 'sistema' | 'avanzado';
  suiteId?: string;
  featureId?: string;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: 'dashboard',
    label: 'Panel Control',
    icon: LayoutDashboard,
    component: null, 
    description: 'Vista general del rendimiento.',
    category: 'operativo'
  },
  {
    id: 'conversations',
    label: 'Inbox AI',
    icon: MessageSquare,
    component: Inbox,
    description: 'Gestión de mensajes multicanal con Copiloto IA.',
    category: 'operativo'
  },
  {
    id: 'agents',
    label: 'Agentes',
    icon: Users,
    component: AgentsManager,
    description: 'Configuración de Personas y Agentes de IA.',
    category: 'operativo',
    suiteId: 'intelligence',
    featureId: 'agents'
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Cpu,
    component: SkillsManager,
    description: 'Herramientas y habilidades extendidas para la IA.',
    category: 'operativo'
  },
  {
    id: 'hitl',
    label: 'HITL',
    icon: ShieldCheck,
    component: HITL,
    description: 'Intervención humana en tiempo real.',
    category: 'operativo'
  },
  {
    id: 'kb',
    label: 'Conocimiento',
    icon: BookOpen,
    component: KnowledgeBase,
    description: 'Gestión de documentos y entrenamiento de la IA.',
    category: 'operativo'
  },
  {
    id: 'predictive',
    label: 'Hub Predictivo',
    icon: TrendingUp,
    component: PredictiveHub,
    description: 'Análisis predictivo de comportamiento.',
    category: 'avanzado',
    suiteId: 'intelligence',
    featureId: 'predictive'
  },
  {
    id: 'protocols',
    label: 'Arq. Protocolos',
    icon: FileText,
    component: ProtocolArchitecture,
    description: 'Diseño de protocolos de comunicación.',
    category: 'avanzado',
    suiteId: 'intelligence',
    featureId: 'protocols'
  },
  {
    id: 'vision',
    label: 'Lab Visión',
    icon: Eye,
    component: VisionLab,
    description: 'Procesamiento de imágenes y visión artificial.',
    category: 'avanzado',
    suiteId: 'intelligence',
    featureId: 'vision'
  },
  {
    id: 'corrections',
    label: 'Correcciones',
    icon: MessageSquareQuote,
    component: CorrectionsManager,
    description: 'Gestión de respuestas pre-aprobadas.',
    category: 'gestion'
  },
  {
    id: 'analytics',
    label: 'Analíticas',
    icon: BarChart3,
    component: Analytics,
    description: 'Métricas avanzadas y reportes de rendimiento.',
    category: 'gestion'
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    component: UserManager,
    description: 'Administración de accesos y perfiles.',
    category: 'gestion'
  },
  {
    id: 'tenants',
    label: 'Inquilinos',
    icon: Layout,
    component: TenantManager,
    description: 'Gestión de múltiples organizaciones.',
    category: 'sistema'
  },
  {
    id: 'catalog',
    label: 'Catálogo Ventas',
    icon: Package,
    component: ProductsManager,
    description: 'Gestión de productos y precios.',
    category: 'gestion',
    suiteId: 'ecommerce',
    featureId: 'catalog'
  },
  {
    id: 'orders',
    label: 'Pedidos',
    icon: ShoppingBag,
    component: OrdersManager,
    description: 'Control de ventas y facturación.',
    category: 'gestion',
    suiteId: 'ecommerce',
    featureId: 'orders'
  },
  {
    id: 'module_manager',
    label: 'Marketplace',
    icon: Package,
    component: ModuleManager,
    description: 'Activación dinámica de capacidades SaaS.',
    category: 'sistema'
  }
];
