document.addEventListener('DOMContentLoaded', () => {

    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const paidByInput = document.getElementById('paidBy');
    const splitWithInput = document.getElementById('splitWith');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expensesListDiv = document.getElementById('expensesList');
    const balancesListDiv = document.getElementById('balancesList');

    let members = {}; 
    let expenses = [];

    
    function getOrAddMember(name) {
        const cleanName = name.trim();
        const lowerCaseName = cleanName.toLowerCase();
        if (!members[lowerCaseName] && cleanName) {
            members[lowerCaseName] = { name: cleanName, balance: 0 };
        }
        return members[lowerCaseName];
    }
    
    function addExpense() {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const paidByName = paidByInput.value.trim();
        
        const splitWithNames = splitWithInput.value.split(',').map(name => name.trim()).filter(Boolean);

        
        if (!description || isNaN(amount) || amount <= 0 || !paidByName || splitWithNames.length === 0) {
            alert('Please fill out all fields correctly.');
            return;
        }

    
        getOrAddMember(paidByName);
        splitWithNames.forEach(name => getOrAddMember(name));

        const newExpense = {
            id: Date.now(),
            description,
            amount,
            paidBy: paidByName.toLowerCase(),
            splitWith: splitWithNames.map(name => name.toLowerCase())
        };
        expenses.push(newExpense);

        descriptionInput.value = '';
        amountInput.value = '';
        paidByInput.value = '';
        splitWithInput.value = '';

        updateUI();
    }


    function updateUI() {
        calculateBalances();
        renderBalances();
        renderExpenses();
    }

    function calculateBalances() {
        
        Object.values(members).forEach(member => member.balance = 0);

        
        expenses.forEach(expense => {
            const payer = members[expense.paidBy];
            const share = expense.amount / expense.splitWith.length;
            
           
            if (payer) payer.balance += expense.amount;

           
            expense.splitWith.forEach(memberName => {
                if (members[memberName]) members[memberName].balance -= share;
            });
        });
    }

    function renderBalances() {
        balancesListDiv.innerHTML = '';
        
        
        const debtors = Object.values(members).filter(m => m.balance < 0).map(m => ({...m}));
        const creditors = Object.values(members).filter(m => m.balance > 0).map(m => ({...m}));

        const transactions = [];

       
        debtors.forEach(debtor => {
            creditors.forEach(creditor => {
                if (debtor.balance === 0 || creditor.balance === 0) return;

                const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                
               
                if (amount < 0.01) return; 

                transactions.push({ from: debtor.name, to: creditor.name, amount: amount });

                debtor.balance += amount;
                creditor.balance -= amount;
            });
        });

        if (transactions.length === 0) {
            balancesListDiv.innerHTML = '<p class="placeholder-text">Everyone is settled up!</p>';
            return;
        }

        transactions.forEach(t => {
            const balanceEl = document.createElement('div');
            balanceEl.className = 'balance-item';
            balanceEl.innerHTML = `
                <div>
                    <span class="balance-from-to">${t.from}</span>
                    <span class="balance-arrow">→</span>
                    <span class="balance-from-to">${t.to}</span>
                </div>
                <span class="balance-amount">$${t.amount.toFixed(2)}</span>
            `;
            balancesListDiv.appendChild(balanceEl);
        });
    }

    function renderExpenses() {
        expensesListDiv.innerHTML = '';
        if (expenses.length === 0) {
             expensesListDiv.innerHTML = '<p class="placeholder-text">No expenses recorded yet.</p>';
             return;
        }

        
        [...expenses].reverse().forEach(expense => {
            const payerName = members[expense.paidBy]?.name || 'Unknown';
            const expenseEl = document.createElement('div');
            expenseEl.className = 'expense-item';
            expenseEl.innerHTML = `
                <div class="expense-details">
                    <p class="description">${expense.description}</p>
                    <p class="paid-by">Paid by ${payerName}</p>
                </div>
                <span class="amount">$${expense.amount.toFixed(2)}</span>
            `;
            expensesListDiv.appendChild(expenseEl);
        });
    }


    
    addExpenseBtn.addEventListener('click', addExpense);

    updateUI();
});
