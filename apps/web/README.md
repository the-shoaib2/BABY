This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# B.A.B.Y. - Enhanced Account Balance System

A comprehensive meal management system with advanced account balance tracking, expense management, and meal rate calculations.

## Features

### Enhanced Account Balance System

The account balance system now includes:

1. **Group Total Balance Calculation**
   - Tracks total deposits and transactions across all group members
   - Shows net group balance after expenses

2. **Expense Integration**
   - Automatic account transaction creation when expenses are added
   - Expenses decrease the group's total balance
   - Proper transaction tracking for expense updates and deletions

3. **Meal Rate Calculation**
   - Calculates meal rate based on total expenses divided by total meals
   - Dynamic meal rate updates as expenses and meals change
   - Supports per-group meal rate calculations

4. **Available Balance for Members**
   - Shows each member's available balance after meal expenses
   - Calculates total spent based on meal count × meal rate
   - Displays meal count and current meal rate for each member

### API Endpoints

#### Account Balance API (`/api/account-balance`)

- **GET** - Retrieve balance information
  - `?roomId=...&all=true` - Get all members' balances (privileged users only)
  - `?roomId=...&userId=...` - Get specific user's balance
  - `?includeDetails=true` - Include meal rate and available balance calculations

- **POST** - Create new account transaction

#### Expenses API (`/api/expenses`)

- **POST** - Add new expense (automatically creates account transaction)
- **GET** - Retrieve expenses with filtering options

#### Transaction History API (`/api/account-balance/transactions`)

- **GET** - Retrieve transaction history for a user in a specific room

### Database Schema

The system uses the following key models:

- **AccountTransaction** - Tracks all financial transactions
- **ExtraExpense** - Stores expense records
- **Meal** - Tracks individual meals
- **RoomMember** - Manages group membership and roles

### UI Components

#### Privileged View (Admins/Owners/Accountants)
- Group total balance overview
- Total expenses and meal rate display
- All members' balances with meal details
- Available balance calculations for each member

#### Member View (Regular Users)
- Personal balance and available balance
- Meal count and total spent
- Current meal rate information
- Transaction history

#### Dashboard Integration
- Enhanced summary cards showing group financials
- Real-time balance updates
- Expense and meal rate overview

## Usage

### For Group Administrators

1. **View Group Financials**
   - Navigate to Account Balance section
   - See group total balance, expenses, and meal rate
   - Monitor all members' available balances

2. **Add Expenses**
   - Use the Expenses section to add new expenses
   - Expenses automatically update account balances
   - Track expense history and receipts

3. **Monitor Meal Rates**
   - View current meal rate based on total expenses and meals
   - Understand how expenses affect per-meal costs

### For Group Members

1. **Check Personal Balance**
   - View current balance and available balance
   - See meal count and total spent on meals
   - Monitor transaction history

2. **Understand Meal Costs**
   - View current meal rate
   - See how many meals you've consumed
   - Calculate your total meal expenses

## Technical Implementation

### Key Functions

- `calculateGroupTotalBalance()` - Calculates total group balance
- `calculateTotalExpenses()` - Sums all group expenses
- `calculateMealRate()` - Computes meal rate from expenses and meals
- `calculateAvailableBalance()` - Determines member's available balance

### Error Handling

- Comprehensive error handling for all calculations
- Graceful fallbacks for missing data
- Detailed logging for debugging

### Performance

- Optimized database queries with proper indexing
- Efficient calculation methods
- Caching through React Query for UI performance

## Future Enhancements

- Export functionality for financial reports
- Advanced analytics and charts
- Payment integration with external services
- Automated meal rate adjustments
- Budget tracking and alerts

## VS Code Extension: B.A.B.Y.

A VS Code extension version of B.A.B.Y. is being developed in the `vscode-extension/` folder. This extension will bring the AI code assistant, flow diagrams, and code summarization features directly to your editor.

### Getting Started
1. Go to the `vscode-extension/` folder.
2. Run `npm install` to install dependencies.
3. Run `npm run watch` or `npm run build` to build the extension.
4. Open the folder in VS Code and press `F5` to launch a new Extension Development Host.

The extension will open a webview panel with the B.A.B.Y. assistant UI. More features coming soon!
