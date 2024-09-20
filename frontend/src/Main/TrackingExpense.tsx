import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // useTranslation をインポート
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TrackingExpense: React.FC = () => {
  const { t } = useTranslation(); // useTranslation フックを使用して翻訳
  const [expenseName, setExpenseName] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [dateText, setDateText] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const submitExpense = async () => {
    const apiUrl = 'http://localhost:3000/api/expenses';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: expenseName,
          date: date.toISOString(),
          amount: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
      }

      toast.success(t('expense_success')); // Toast for success
      setExpenseName('');
      setDate(new Date());
      setDateText('');
      setAmount('');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`${t('expense_failed')}: ${error.message}`);
      } else {
        toast.error(t('unknown_error'));
      }
    }
  };

  const validateDate = (text: string) => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(text)) {
      setDate(new Date(text));
      setDateText(text);
    } else {
      setDateText(text);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <input
        style={styles.input}
        value={expenseName}
        onChange={(e) => setExpenseName(e.target.value)}
        placeholder={t('expense_name')}
      />
      <input
        style={styles.input}
        value={dateText}
        onChange={(e) => validateDate(e.target.value)}
        placeholder={t('enter_date')}
      />
      <input
        style={styles.input}
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder={t('amount')}
        type="text"
      />
      <button style={styles.button} onClick={submitExpense}>
        {t('add_expense')}
      </button>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '50px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center' as const,
  },
  input: {
    width: '100%',
    maxWidth: '600px',
    height: '40px',
    borderColor: 'gray',
    borderWidth: '1px',
    borderRadius: '5px',
    padding: '10px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  button: {
    backgroundColor: 'skyblue',
    padding: '15px 40px',
    borderRadius: '5px',
    alignItems: 'center' as const,
    marginTop: '10px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    border: 'none',
    cursor: 'pointer',
  },
};

export default TrackingExpense;
