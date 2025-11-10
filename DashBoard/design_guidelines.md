# Health Analytics Dashboard - Design Guidelines

## Design Approach
**System-Based Approach**: Material Design for data-heavy healthcare applications
- Prioritizes clarity, hierarchy, and trust for health data
- Strong patterns for forms, data visualization, and progressive disclosure
- Proven in medical/analytics contexts

## Layout Architecture

### Page Structure (Single Scrollable Page)
1. **Header Bar** (fixed, h-16): App title, user account menu
2. **Looker Studio Section** (h-[600px]): Full-width embedded iframe with subtle border
3. **Prediction Module** (natural height): Form inputs + results display
4. **Footer** (minimal, py-8): Privacy policy, data handling disclaimer

### Spacing System
Use Tailwind units: **4, 6, 8, 12, 16** for consistency
- Section padding: `py-12 px-6 md:px-8`
- Component gaps: `gap-6` for form groups, `gap-4` for related items
- Card padding: `p-6`
- Container max-width: `max-w-7xl mx-auto`

## Typography Hierarchy

**Font Stack**: Google Fonts - Inter (primary) + JetBrains Mono (data/numbers)

- **Page Title**: text-3xl font-bold (Inter)
- **Section Headers**: text-2xl font-semibold
- **Subsections**: text-lg font-medium
- **Body Text**: text-base font-normal
- **Labels**: text-sm font-medium uppercase tracking-wide
- **Data/Numbers**: text-lg font-mono (JetBrains Mono) for all numeric displays
- **Helper Text**: text-sm text-gray-600

## Component Specifications

### Looker Studio Embed Section
- Full-width container with `max-w-7xl mx-auto`
- Iframe with rounded corners (`rounded-lg`), subtle shadow (`shadow-lg`)
- Loading state placeholder with skeleton animation
- Aspect ratio: 16:9 or fixed height (600px)

### Prediction Form Layout
**Two-Column Grid** (desktop): `grid grid-cols-1 lg:grid-cols-2 gap-8`

**Left Column - Input Form**:
- Card container: `bg-white rounded-lg shadow-md p-6`
- Form groups in vertical stack with `space-y-6`
- Input fields:
  - Labels above inputs with required asterisks
  - Text inputs: `h-11` with subtle border, `rounded-md`
  - Number steppers for age, BMI, cholesterol, BP, steps, sleep hours
  - Toggle switches for binary (smoker, alcohol, family_history)
  - Validation states: green check for valid, red border for errors
- Submit button: `w-full h-12` prominent, raised elevation

**Right Column - Results Display**:
- Card container matching input form style
- **Risk Meter Visualization**:
  - Circular gauge or horizontal progress bar
  - Risk percentage prominently displayed (`text-4xl font-bold`)
  - Risk level indicator (Low/Moderate/High/Critical) with corresponding visual weight
  - Icon representation (shield, heart, alert)
- **Recommendations Section**:
  - Bulleted list of personalized health insights
  - Each recommendation in a subtle card (`bg-gray-50 rounded p-4 mb-3`)
  - Icons for different recommendation types (exercise, diet, sleep, medical)

### Empty States
- Before prediction: Illustration/icon with "Enter your health metrics to see your risk assessment" message
- Loading state: Spinner with "Analyzing your health data..." text

### Data Input Components
- **Number Inputs**: Include increment/decrement buttons, min/max constraints
- **Toggle Switches**: Material Design style with smooth transitions
- **Validation**: Real-time inline validation with clear error messages below fields

## Visual Hierarchy

### Information Priority
1. **Primary**: Risk prediction result (largest, boldest)
2. **Secondary**: Looker Studio charts, input form
3. **Tertiary**: Recommendations, helper text

### Card Elevation
- Level 1: `shadow-sm` for subtle containers
- Level 2: `shadow-md` for main content cards
- Level 3: `shadow-lg` for elevated elements (Looker embed)

## Responsive Behavior

**Mobile** (< 768px):
- Single column layout for prediction module
- Looker Studio height: 400px
- Form and results stack vertically
- Reduced padding: `px-4 py-8`

**Desktop** (≥ 1024px):
- Two-column prediction layout
- Looker Studio height: 600px
- Generous spacing and larger touch targets

## Icons
**Heroicons** (via CDN) - outline style for consistency
- Form fields: DocumentTextIcon, HeartIcon, UserIcon
- Risk levels: ShieldCheckIcon, ExclamationTriangleIcon
- Recommendations: LightBulbIcon, ChartBarIcon

## Accessibility
- Form labels with `for` attributes
- ARIA labels for all interactive elements
- Focus indicators on all inputs (2px ring)
- Sufficient contrast ratios (WCAG AA minimum)
- Keyboard navigation support throughout

## Micro-interactions (Minimal)
- Form input focus: subtle border highlight
- Submit button: slight scale on click
- Results appear: gentle fade-in (300ms)
- Toggle switches: smooth slide animation

**No background animations or decorative motion**

This dashboard prioritizes data clarity, medical trust, and efficient data entry for health predictions.