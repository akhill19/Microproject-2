// Utility function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Dashboard component
const Dashboard = {
    template: `
    <div>
        <h2 class="mb-4">Dashboard</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Total Balance</h5>
                        <p class="card-text display-4" :class="totalBalance >= 0 ? 'text-success' : 'text-danger'">
                            {{ formatCurrency(totalBalance) }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Recent Transactions</h5>
                        <ul class="list-group list-group-flush">
                            <li v-for="transaction in recentTransactions" :key="transaction.id" class="list-group-item d-flex justify-content-between align-items-center">
                                <span>{{ transaction.description }}</span>
                                <span :class="['badge', transaction.amount > 0 ? 'bg-success' : 'bg-danger', 'rounded-pill']">
                                    {{ formatCurrency(transaction.amount) }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
`,
    computed: {
        totalBalance() {
            return this.$root.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        },
        recentTransactions() {
            return this.$root.transactions.slice(-5).reverse();
        }
    },
    methods: {
        formatCurrency
    }
};

// Overview component
const Overview = {
    template: `
        <div>
            <h2 class="mb-4">Financial Overview</h2>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Income vs Expense</h5>
                            <canvas ref="incomeExpenseChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Balance Trend</h5>
                            <canvas ref="balanceTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        this.createIncomeExpenseChart();
        this.createBalanceTrendChart();
    },
    methods: {
        createIncomeExpenseChart() {
            const ctx = this.$refs.incomeExpenseChart;
            const income = this.$root.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const expense = Math.abs(this.$root.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Income', 'Expense'],
                    datasets: [{
                        data: [income, expense],
                        backgroundColor: ['#28a745', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Income vs Expense'
                    }
                }
            });
        },
        createBalanceTrendChart() {
            const ctx = this.$refs.balanceTrendChart;
            const sortedTransactions = [...this.$root.transactions].sort((a, b) => a.date - b.date);
            const balances = sortedTransactions.reduce((acc, t) => {
                const lastBalance = acc.length > 0 ? acc[acc.length - 1] : 0;
                acc.push(lastBalance + t.amount);
                return acc;
            }, []);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedTransactions.map(t => new Date(t.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Balance',
                        data: balances,
                        borderColor: '#007bff',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Balance Trend'
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
};

// AddTransaction component (previously named Transactions)
const AddTransaction = {
    template: `
        <div>
            <h2 class="mb-4">Add Transaction</h2>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="addTransaction" class="mb-4">
                        <div class="row g-3">
                            <div class="col-sm-4">
                                <input v-model="newTransaction.description" type="text" class="form-control" placeholder="Description" required>
                            </div>
                            <div class="col-sm-3">
                                <input v-model.number="newTransaction.amount" type="number" step="0.01" class="form-control" placeholder="Amount" required>
                            </div>
                            <div class="col-sm-3">
                                <input v-model="newTransaction.date" type="date" class="form-control" required>
                            </div>
                            <div class="col-sm-2">
                                <button type="submit" class="btn btn-primary w-100">Add</button>
                            </div>
                        </div>
                    </form>
                    <div v-if="showConfirmation" class="alert alert-success" role="alert">
                        Transaction added successfully!
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            newTransaction: {
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0]
            },
            showConfirmation: false
        };
    },
    methods: {
        addTransaction() {
            this.$root.transactions.push({
                id: Date.now(),
                description: this.newTransaction.description,
                amount: this.newTransaction.amount,
                date: new Date(this.newTransaction.date).getTime()
            });
            this.newTransaction.description = '';
            this.newTransaction.amount = 0;
            this.newTransaction.date = new Date().toISOString().split('T')[0];
            
            // Show confirmation message
            this.showConfirmation = true;
            setTimeout(() => {
                this.showConfirmation = false;
            }, 3000); // Hide the message after 3 seconds
        }
    }
};

// Transaction History component
const TransactionHistory = {
    template: `
        <div>
            <h2 class="mb-4">Transaction History</h2>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="transaction in sortedTransactions" :key="transaction.id">
                                    <td>{{ new Date(transaction.date).toLocaleDateString() }}</td>
                                    <td>{{ transaction.description }}</td>
                                    <td :class="transaction.amount > 0 ? 'text-success' : 'text-danger'">
                                        {{ formatCurrency(transaction.amount) }}
                                    </td>
                                    <td>
                                        <button @click="deleteTransaction(transaction.id)" class="btn btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        sortedTransactions() {
            return [...this.$root.transactions].sort((a, b) => b.date - a.date);
        }
    },
    methods: {
        formatCurrency,
        deleteTransaction(id) {
            const index = this.$root.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                this.$root.transactions.splice(index, 1);
            }
        }
    }
};

// Main Vue application
const app = Vue.createApp({
    data() {
        return {
            currentPage: 'dashboard',
            transactions: JSON.parse(localStorage.getItem('transactions')) || [
                { id: 1, description: 'Salary', amount: 3000, date: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                { id: 2, description: 'Rent', amount: -1000, date: Date.now() - 5 * 24 * 60 * 60 * 1000 },
                { id: 3, description: 'Groceries', amount: -200, date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                { id: 4, description: 'Utilities', amount: -150, date: Date.now() - 2 * 24 * 60 * 60 * 1000 },
                { id: 5, description: 'Savings', amount: -500, date: Date.now() - 1 * 24 * 60 * 60 * 1000 }
            ]
        };
    },
    watch: {
        transactions: {
            handler(newTransactions) {
                localStorage.setItem('transactions', JSON.stringify(newTransactions));
            },
            deep: true
        }
    },
    components: {
        dashboard: Dashboard,
        overview: Overview,
        transactions: AddTransaction,
        history: TransactionHistory
    }
});


app.mount('#app');