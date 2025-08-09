-- Delete test wallet profiles created during testing
DELETE FROM public.profiles 
WHERE wallet_address IS NOT NULL 
AND created_at > '2025-08-09 20:40:00'
AND display_name LIKE '0x%';

-- Delete any auth users for these test wallet addresses (if they exist)
-- Note: We can't directly delete from auth.users, but the trigger should handle cleanup