import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Expense {
  _id: string;
  name: string;
  date: string;
  amount: number;
}

const RecordedExpense: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const apiURL = 'http://localhost:3000/api/expenses';
        const response = await fetch(apiURL);
        if (!response.ok) {
          const errorRes = await response.json();
          throw new Error(errorRes.error || `Failed to fetch expenses. Status code: ${response.status}`);
        }
        const result = await response.json();
        setExpenses(result);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      }
    };
    loadExpenses();
  }, []);

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.error || `Failed to delete the expense. Status code: ${response.status}`);
      }
      setExpenses(currentExpenses => currentExpenses.filter(expense => expense._id !== id));
      toast.success('Expense deleted successfully');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const renderItem = (item: Expense) => (
    <div style={styles.item} key={item._id}>
      <h2 style={styles.title}>{item.name}</h2>
      <p style={styles.date}>{new Date(item.date).toLocaleDateString()}</p>
      <p style={styles.amount}>${item.amount ? item.amount.toFixed(2) : '0.00'}</p>
      <button style={styles.button} onClick={() => handleDeleteExpense(item._id)}>
        Delete
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <ToastContainer />
      {expenses.length === 0 ? (
        <p style={styles.noExpenses}>No expenses recorded yet</p>
      ) : (
        expenses.map(renderItem)
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
    justifyContent: 'center',
  },
  item: {
    backgroundColor: '#e6f7ff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    transition: 'transform 0.2s ease',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: 'black',
  },
  date: {
    fontSize: '14px',
    color: 'black',
    marginBottom: '10px',
  },
  amount: {
    fontSize: '18px',
    color: 'black',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#1890ff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },
  noExpenses: {
    fontSize: '18px',
    textAlign: 'center' as const,
    color: '#5c7cfa',
  },
};

export default RecordedExpense;
