# TrakNor CMMS - Frontend Prototype

A React-based frontend prototype for a comprehensive HVAC maintenance management system following Brazilian PMOC standards.

**Experience Qualities**:
1. Professional - Clean, modern interface that inspires confidence in industrial environments
2. Efficient - Streamlined workflows that minimize clicks and maximize productivity for field technicians
3. Reliable - Clear status indicators and consistent interactions that reduce user errors

**Complexity Level**: Light Application (multiple features with basic state)
This prototype demonstrates core CMMS functionality with persistent state management, multiple interconnected features, and comprehensive data visualization without requiring full backend infrastructure.

## Essential Features

### Dashboard Overview
- **Functionality**: Real-time KPI display, maintenance schedule overview, equipment status monitoring
- **Purpose**: Provides immediate situational awareness for maintenance managers and technicians
- **Trigger**: User navigates to main dashboard after login
- **Progression**: Login → Dashboard loads → KPI cards display → Charts render → Upcoming maintenance table populates
- **Success criteria**: All metrics display correctly, charts are interactive, navigation is intuitive

### Equipment Management
- **Functionality**: CRUD operations for HVAC equipment, maintenance history tracking, status monitoring
- **Purpose**: Centralized equipment database for maintenance planning and compliance
- **Trigger**: User clicks "Ativos" in navigation menu
- **Progression**: Navigate to Ativos → Equipment list loads → Filter/search → View details → Edit/Add equipment
- **Success criteria**: Equipment can be added, edited, filtered, and status updated successfully

### Work Order System
- **Functionality**: Create, assign, execute, and close maintenance work orders with digital checklists
- **Purpose**: Standardize maintenance procedures and ensure PMOC compliance
- **Trigger**: User clicks "Ordens de Serviço" or creates from equipment page
- **Progression**: View work orders → Filter by status → Open work order → Execute checklist → Upload photos → Complete
- **Success criteria**: Work orders can be created, executed with checklists, and marked complete

### Maintenance Planning
- **Functionality**: Create preventive maintenance schedules, generate automatic work orders
- **Purpose**: Proactive maintenance planning to prevent equipment failures
- **Trigger**: User navigates to "Planos" section
- **Progression**: View plans → Create new plan → Set schedule → Define checklist → Activate plan
- **Success criteria**: Plans can be created with schedules and automatically generate work orders

### Inventory Management
- **Functionality**: Track spare parts, manage stock levels, record usage in work orders
- **Purpose**: Ensure parts availability and cost tracking for maintenance activities
- **Trigger**: User clicks "Estoque" in navigation
- **Progression**: View inventory → Search parts → Update stock → Record usage → Generate reports
- **Success criteria**: Inventory levels are tracked and updated when parts are used

## Edge Case Handling
- **Empty States**: Helpful messages and action buttons when no data exists
- **Network Errors**: Graceful degradation with offline capability using local storage
- **Invalid Data**: Form validation with clear error messages and correction guidance
- **Mobile Access**: Responsive design that works on tablets for field technicians
- **Large Datasets**: Pagination and virtual scrolling for equipment lists and work orders

## Design Direction
The design should feel professional and trustworthy like enterprise software, with a clean industrial aesthetic that works well in both office and field environments. The interface should be information-dense but not cluttered, with clear visual hierarchy that guides users through complex workflows efficiently.

## Color Selection
Complementary (opposite colors) - Using a professional blue-green palette that conveys reliability and cleanliness, essential for HVAC industry trust.

- **Primary Color**: Deep Teal (oklch(0.45 0.15 200)) - Communicates professionalism and technical expertise
- **Secondary Colors**: Light Gray (oklch(0.95 0.02 200)) for backgrounds, Dark Blue (oklch(0.25 0.1 240)) for accents
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) for CTAs and alerts, drawing attention to important actions
- **Foreground/Background Pairings**: 
  - Background (Light Gray): Dark text (oklch(0.15 0.02 200)) - Ratio 12.8:1 ✓
  - Primary (Deep Teal): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Light Gray): Dark text (oklch(0.25 0.1 240)) - Ratio 11.1:1 ✓
  - Accent (Warm Orange): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓

## Font Selection
Typography should convey precision and clarity essential for technical documentation and field work. Inter for its excellent legibility at all sizes and professional appearance suitable for both data tables and user interfaces.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal letter spacing  
  - H3 (Card Titles): Inter Medium/18px/normal letter spacing
  - Body Text: Inter Regular/14px/relaxed line height
  - Small Text (Labels): Inter Medium/12px/wide letter spacing

## Animations
Subtle and purposeful animations that enhance workflow efficiency without distracting from critical maintenance tasks. Motion should feel precise and professional, matching the industrial context.

- **Purposeful Meaning**: Smooth transitions guide users through multi-step processes like work order execution
- **Hierarchy of Movement**: Status changes and form submissions get priority, decorative animations are minimal

## Component Selection
- **Components**: Card for equipment items, Table for work orders, Modal for equipment details, Tabs for different data views, Badge for status indicators, Button with loading states, Form with validation
- **Customizations**: Custom KPI cards with status indicators, specialized checklist component for work orders, equipment status visualization
- **States**: Clear active/inactive states for equipment, work order status progression (open→in progress→completed), inventory level indicators (low/normal/high)
- **Icon Selection**: Equipment icons (Gear, Wrench), status icons (CheckCircle, AlertTriangle), navigation icons (Home, List, Calendar)
- **Spacing**: Consistent 4px base unit, generous padding for touch targets, logical grouping with whitespace
- **Mobile**: Collapsible navigation, responsive tables with horizontal scroll, touch-friendly button sizes (minimum 44px), simplified layouts for small screens