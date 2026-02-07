-- Update create_provider_profile function to set is_verified = true by default
CREATE OR REPLACE FUNCTION public.create_provider_profile(
  _user_id uuid, 
  _name text, 
  _email text, 
  _provider_type provider_type, 
  _license_number text DEFAULT NULL, 
  _specialization text DEFAULT NULL, 
  _governorate text DEFAULT NULL, 
  _address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _provider_id uuid;
BEGIN
  -- Check if provider already exists for this user
  SELECT id INTO _provider_id FROM public.providers WHERE user_id = _user_id;
  
  IF _provider_id IS NOT NULL THEN
    RETURN _provider_id;
  END IF;
  
  -- Insert new provider with is_verified = true so they appear to patients immediately
  INSERT INTO public.providers (
    user_id, 
    name, 
    email, 
    provider_type, 
    license_number, 
    specialization, 
    governorate, 
    address,
    is_verified
  )
  VALUES (
    _user_id, 
    _name, 
    _email, 
    _provider_type, 
    _license_number, 
    _specialization, 
    _governorate, 
    _address,
    true
  )
  RETURNING id INTO _provider_id;
  
  RETURN _provider_id;
END;
$function$;