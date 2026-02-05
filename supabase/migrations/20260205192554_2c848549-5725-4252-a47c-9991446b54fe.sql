-- Add dental and cosmetic to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'dental';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cosmetic';

-- Add dental and cosmetic to provider_type enum
ALTER TYPE public.provider_type ADD VALUE IF NOT EXISTS 'dental';
ALTER TYPE public.provider_type ADD VALUE IF NOT EXISTS 'cosmetic';