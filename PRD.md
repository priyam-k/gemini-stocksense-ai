# Planning Guide

An AI-powered stock analysis platform that transforms novice investors into informed decision-makers by providing real-time market insights, AI-generated explanations of price movements, and interactive step-by-step learning experiences.

**Experience Qualities**:
1. **Educational** - Every interaction teaches the user something new about investing, from basic concepts to advanced analysis techniques
2. **Insightful** - AI-powered explanations demystify complex market movements by connecting stock behavior to real-world news and trends
3. **Interactive** - Hands-on learning through guided analysis exercises with questions that develop critical thinking skills

**Complexity Level**: Complex Application (advanced functionality, accounts)
- This app requires sophisticated AI integration for market analysis, real-time data fetching from financial APIs, persistent user learning progress tracking, and interactive teaching sessions with conversational AI

## Essential Features

### Real-Time Stock Data & Chart Display
- **Functionality**: Fetches and displays live stock prices, historical data, and interactive price charts with multiple timeframes (1D, 1W, 1M, 3M, 1Y)
- **Purpose**: Provides the foundational data layer that all insights and analysis are built upon
- **Trigger**: User searches for a stock symbol or selects from a watchlist
- **Progression**: Search/select stock → Fetch real-time data from API → Display current price with % change → Render interactive chart → Update periodically
- **Success criteria**: Stock data loads within 2 seconds, chart is interactive and responsive, prices update every 30 seconds

### AI-Powered Movement Analysis
- **Functionality**: Analyzes recent stock price movements and generates natural language explanations connecting changes to news events, earnings reports, sector trends, and market sentiment. When technical patterns are detected (triangles, head-and-shoulders, double tops/bottoms, support/resistance levels, trend channels), hovering over these insights dynamically overlays visual pattern indicators on the price chart.
- **Purpose**: Helps users understand the "why" behind price movements rather than just seeing numbers change, and visually demonstrates technical analysis patterns in real-time
- **Trigger**: Stock is loaded or user clicks "Analyze Movement" button
- **Progression**: Detect significant price changes → Fetch recent news → AI analyzes correlation & detects chart patterns → Generate insight card → Display with supporting data → Hover over technical pattern insight → Chart highlights pattern with lines, points, and labels
- **Success criteria**: Insights generated within 5 seconds, explanations are accurate and cite specific news sources, 3-5 key insights per stock, pattern overlays render smoothly on hover with clear visual indicators

### Market Forecast & Predictions
- **Functionality**: AI examines technical indicators, historical patterns, news sentiment, and market conditions to provide educational forecasts with confidence levels and reasoning
- **Purpose**: Shows users what experienced investors look for when making predictions, teaching pattern recognition
- **Trigger**: User navigates to "Forecast" tab on stock detail view
- **Progression**: Load stock fundamentals → Analyze technical indicators → Process sentiment data → Generate forecast with reasoning → Display confidence levels → Highlight key factors
- **Success criteria**: Forecasts include clear reasoning, confidence percentages, time horizons (short/medium/long-term), and educational callouts explaining each factor

### Interactive Teaching Assistant
- **Functionality**: Step-by-step guided analysis sessions where AI asks questions about the stock, waits for user responses, provides feedback, and progressively reveals deeper analytical techniques
- **Trigger**: User clicks "Learn to Analyze" button or starts a teaching session
- **Progression**: AI introduces concept → Shows relevant data → Asks analytical question → User responds → AI provides feedback and explanation → Next concept → Progress tracked
- **Success criteria**: Sessions are conversational, questions adapt to user skill level, progress is saved, users can pause/resume sessions, completion provides achievement feedback

### Watchlist Management
- **Functionality**: Users can create and manage a personalized watchlist of stocks with quick access to insights and analysis
- **Purpose**: Enables tracking multiple investments and comparing AI insights across portfolio
- **Trigger**: User clicks "Add to Watchlist" star icon on any stock
- **Progression**: Click watchlist icon → Stock added with confirmation → Appears in watchlist sidebar → Quick access from anywhere → Remove by clicking again
- **Success criteria**: Watchlist persists across sessions, displays mini-cards with price changes, accessible from all views

## Edge Case Handling

- **Invalid Stock Symbol**: Display helpful message suggesting similar valid symbols or popular alternatives
- **API Rate Limiting**: Gracefully fall back to cached data with timestamp indicator, queue requests intelligently
- **Slow Network**: Show skeleton loading states, allow partial rendering, cache aggressively
- **AI Generation Failures**: Fall back to template-based insights using technical indicators, retry with exponential backoff
- **Market Closed Hours**: Clearly indicate last update time, show pre-market/after-hours data when available
- **Empty Watchlist**: Show engaging onboarding with suggested popular stocks to get started
- **Learning Session Interruption**: Auto-save progress every response, allow resume from last checkpoint

## Design Direction

The design should evoke confidence and clarity while remaining approachable for beginners - professional yet not intimidating, with a modern fintech aesthetic that balances data density with breathing room. A minimal interface that progressively reveals complexity as users engage, featuring smooth transitions and subtle data visualizations that guide attention to key insights.

## Color Selection

**Triadic** (three equally spaced colors) - Using a sophisticated palette of deep blue (trust/stability), vibrant green (growth/profit), and coral (energy/alerts) to create visual hierarchy between different types of information while maintaining professional credibility.

- **Primary Color**: Deep Blue `oklch(0.45 0.15 250)` - Communicates trust, stability, and professionalism essential for financial applications
- **Secondary Colors**: Slate Gray `oklch(0.55 0.02 250)` for neutral UI elements, Cool White `oklch(0.98 0.01 250)` for backgrounds
- **Accent Color**: Vibrant Green `oklch(0.65 0.20 145)` for positive movements, growth indicators, and success states
- **Foreground/Background Pairings**:
  - Background (Cool White `oklch(0.98 0.01 250)`): Primary text `oklch(0.25 0.02 250)` - Ratio 12.4:1 ✓
  - Card (White `oklch(1 0 0)`): Primary text `oklch(0.25 0.02 250)` - Ratio 13.8:1 ✓
  - Primary (Deep Blue `oklch(0.45 0.15 250)`): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
  - Secondary (Slate `oklch(0.55 0.02 250)`): Dark text `oklch(0.25 0.02 250)` - Ratio 4.9:1 ✓
  - Accent (Vibrant Green `oklch(0.65 0.20 145)`): Dark text `oklch(0.20 0.02 250)` - Ratio 7.8:1 ✓
  - Muted (Light Gray `oklch(0.95 0.005 250)`): Muted text `oklch(0.50 0.02 250)` - Ratio 6.2:1 ✓
  - Destructive (Coral Red `oklch(0.60 0.22 25)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓

## Font Selection

Typography should convey clarity and precision while remaining highly legible across dense financial data - a contemporary sans-serif with excellent number rendering (tabular figures) paired with a clean UI font for body text.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold / 32px / -0.02em letter-spacing / Used for main page headers
  - H2 (Stock Symbol): Inter SemiBold / 28px / -0.01em / Stock ticker and major section headers
  - H3 (Section Headers): Inter SemiBold / 20px / -0.01em / Card titles, insight headers
  - H4 (Subsections): Inter Medium / 16px / 0em / Smaller groupings within cards
  - Body (Primary): Inter Regular / 15px / 1.5 line-height / Main content and descriptions
  - Body (Small): Inter Regular / 13px / 1.4 line-height / Supporting text and metadata
  - Price Display: Inter SemiBold / 36px / tabular-nums / Real-time prices
  - Data Labels: Inter Medium / 13px / 0.01em / Chart labels and data points
  - Button Text: Inter Medium / 14px / 0.005em / All interactive elements

## Animations

Animations should feel responsive and data-driven, with subtle emphasis on real-time updates and smooth transitions that don't distract from information density - every motion should either confirm an action or guide attention to important changes.

- **Purposeful Meaning**: Price changes pulse subtly when updating, insight cards slide in sequentially to create rhythm, chart data animates smoothly to show temporal relationships
- **Hierarchy of Movement**: Real-time price updates get immediate attention with subtle color flash, secondary insights fade in gracefully, background data loads without animation

## Component Selection

- **Components**: 
  - **Card** - Primary container for stock details, insights, and forecasts with subtle shadows
  - **Tabs** - Switch between Overview, Analysis, Forecast, and Learn modes
  - **Sheet** - Teaching assistant sidebar sliding from right, replacing watchlist when open
  - **Input** - Stock search with autocomplete styling, learning session text input
  - **Button** - Primary actions (Generate Insights, Generate Forecast, Start Learning), secondary (Add to Watchlist)
  - **Badge** - Stock status indicators, sentiment tags, confidence levels, technical pattern labels
  - **Separator** - Divide sections without heavy visual weight
  - **ScrollArea** - Watchlist sidebar and news feed (not used in teaching assistant due to scroll issues)
  - **Skeleton** - Loading states for async data
  - **Progress** - Learning session completion tracking
  
- **Customizations**: 
  - Custom stock chart component using D3 with interactive tooltips and pattern annotations
  - Animated price ticker with color-coded changes
  - Insight cards with technical pattern highlights, expandable news links, and source citations
  - Conversational UI sidebar for teaching assistant with proper native scrolling
  - Technical pattern badges and visual indicators on charts
  - News article cards with sentiment indicators and external links
  
- **States**:
  - Buttons: Solid primary for main actions, ghost for secondary, loading spinner for async operations
  - Inputs: Focused state with blue ring, search shows dropdown results on focus
  - Cards: Hover lifts with shadow increase, active insights have accent border
  - Price displays: Green for positive, red for negative, neutral for unchanged
  
- **Icon Selection**:
  - **TrendUp/TrendDown** (Phosphor) - Price movement indicators
  - **ChartLine** - Charts and analysis sections
  - **Lightbulb** - Insights and teaching moments
  - **Star/StarFill** - Watchlist toggle
  - **MagnifyingGlass** - Stock search
  - **Robot** - AI teaching assistant
  - **NewspaperClipping** - News and events
  - **Question** - Interactive quiz elements
  
- **Spacing**: 
  - Container padding: `p-6` for cards, `p-8` for main content areas
  - Gap between elements: `gap-4` for related items, `gap-6` for distinct sections
  - Stack spacing: `space-y-4` for vertical lists, `space-y-6` for major sections
  
- **Mobile**: 
  - Watchlist collapses to bottom sheet on mobile
  - Chart adjusts to full width with touch interactions
  - Teaching assistant sidebar takes full width on mobile devices
  - Stock search becomes primary navigation with hamburger menu
  - Cards stack vertically with consistent padding
  - Bottom navigation for main tabs (Overview, Watchlist, Learn)
  - Learning sidebar slides over entire viewport on small screens

## Technical Implementation Notes

### AI Integration
- Uses Spark runtime `spark.llm()` API with GPT-4o for insights and forecasts, GPT-4o-mini for teaching sessions
- All prompts constructed with `spark.llmPrompt` template literal function
- JSON mode enabled for structured outputs with pattern detection and news linking
- Technical pattern detection algorithm identifies: trend reversals, support/resistance tests, breakouts, high volatility, strong trends
- Fallback to algorithmic insights if AI generation fails

### Data Sources
- Stock data: Alpha Vantage API (with demo key, graceful fallback to mock data)
- News: Finnhub API (with demo key, graceful fallback to mock data)
- Historical data: Alpha Vantage Time Series Daily
- Real-time updates: Fetch API with error handling

### Technical Patterns Detected
- Trend Reversal (Bearish to Bullish / Bullish to Bearish)
- Resistance Level Test
- Support Level Test  
- High Volatility Period
- Strong Uptrend / Strong Downtrend
- Head and Shoulders, Double Top, Triangle patterns (via AI analysis)
- Breakout patterns (via AI analysis)
  - Learning sidebar slides over entire viewport on small screens

## Technical Implementation Notes

### AI Integration
- Uses Spark runtime `spark.llm()` API with GPT-4o for insights and forecasts, GPT-4o-mini for teaching sessions
- All prompts constructed with `spark.llmPrompt` template literal function
- JSON mode enabled for structured outputs with pattern detection and news linking
- Technical pattern detection algorithm identifies: trend reversals, support/resistance tests, breakouts, high volatility, strong trends
- Fallback to algorithmic insights if AI generation fails

### Data Sources
- Stock data: Alpha Vantage API (with demo key, graceful fallback to mock data)
- News: Finnhub API (with demo key, graceful fallback to mock data)
- Historical data: Alpha Vantage Time Series Daily
- Real-time updates: Fetch API with error handling

### Technical Patterns Detected
- Trend Reversal (Bearish to Bullish / Bullish to Bearish)
- Resistance Level Test
- Support Level Test  
- High Volatility Period
- Strong Uptrend / Strong Downtrend
- Head and Shoulders, Double Top, Triangle patterns (via AI analysis)
- Breakout patterns (via AI analysis)
