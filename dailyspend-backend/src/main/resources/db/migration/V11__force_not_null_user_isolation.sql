-- =====================================================
-- Migration V11: Force NOT NULL user isolation & indices
-- =====================================================

-- Assign default user (first user) to any orphan rows, if a user exists
UPDATE accounts 
SET user_id = (SELECT MIN(id) FROM users) 
WHERE user_id IS NULL AND (SELECT COUNT(*) FROM users) > 0;

UPDATE transactions 
SET user_id = (SELECT MIN(id) FROM users) 
WHERE user_id IS NULL AND (SELECT COUNT(*) FROM users) > 0;

UPDATE people 
SET user_id = (SELECT MIN(id) FROM users) 
WHERE user_id IS NULL AND (SELECT COUNT(*) FROM users) > 0;

-- Alter columns to force NOT NULL constraint
ALTER TABLE accounts
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE transactions
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE people
ALTER COLUMN user_id SET NOT NULL;

-- Create composite indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON transactions(user_id, account_id);
