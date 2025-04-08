
if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify([
        { category_id: 1, name: 'Food & Drinks', icon: '🍔', color: '#f94144' },
        { category_id: 2, name: 'Groceries', icon: '🥦', color: '#f3722c' },
        { category_id: 3, name: 'Shopping', icon: '🛍️', color: '#f9844a' },
        { category_id: 4, name: 'Bills & Utilities', icon: '💡', color: '#f9c74f' },
        { category_id: 5, name: 'Entertainment', icon: '🎬', color: '#90be6d' },
        { category_id: 6, name: 'Health', icon: '💊', color: '#43aa8b' },
        { category_id: 7, name: 'Education', icon: '🎓', color: '#577590' },
        { category_id: 8, name: 'Subscriptions', icon: '📺', color: '#277da1' },
        { category_id: 9, name: 'Travel', icon: '✈️', color: '#8e44ad' },
        { category_id: 10, name: 'Rent', icon: '🏠', color: '#34495e' },
        { category_id: 11, name: 'Family & Friends', icon: '👨‍👩‍👧‍👦', color: '#3498db' },
        { category_id: 12, name: 'Miscellaneous', icon: '📌', color: '#bdc3c7' },
        { category_id: 13, name: 'Gifts', icon: '🎁', color: '#c0392b' },
        { category_id: 14, name: 'Party', icon: '🥳', color: '#e67e22' }

    ]));
}
else {
    localStorage.setItem('categories', JSON.stringify([
        { category_id: 1, name: 'Food & Drinks', icon: '🍔', color: '#f94144' },
        { category_id: 2, name: 'Groceries', icon: '🥦', color: '#f3722c' },
        { category_id: 3, name: 'Shopping', icon: '🛍️', color: '#f9844a' },
        { category_id: 4, name: 'Bills & Utilities', icon: '💡', color: '#f9c74f' },
        { category_id: 5, name: 'Entertainment', icon: '🎬', color: '#90be6d' },
        { category_id: 6, name: 'Health', icon: '💊', color: '#43aa8b' },
        { category_id: 7, name: 'Education', icon: '🎓', color: '#577590' },
        { category_id: 8, name: 'Subscriptions', icon: '📺', color: '#277da1' },
        { category_id: 9, name: 'Travel', icon: '✈️', color: '#8e44ad' },
        { category_id: 10, name: 'Rent', icon: '🏠', color: '#34495e' },
        { category_id: 11, name: 'Family & Friends', icon: '👨‍👩‍👧‍👦', color: '#3498db' },
        { category_id: 12, name: 'Miscellaneous', icon: '📌', color: '#bdc3c7' },
        { category_id: 13, name: 'Gifts', icon: '🎁', color: '#c0392b' },
        { category_id: 14, name: 'Party', icon: '🥳', color: '#e67e22' }

    ]));
}

if (!localStorage.getItem('expenses')) {
    localStorage.setItem('expenses', JSON.stringify([]));
}

