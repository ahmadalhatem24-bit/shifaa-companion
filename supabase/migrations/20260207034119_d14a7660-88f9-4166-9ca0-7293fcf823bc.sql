
-- Create a function to set user role after signup (bypasses RLS)
CREATE OR REPLACE FUNCTION public.set_user_role(_user_id uuid, _role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET role = _role
  WHERE user_id = _user_id;
  
  -- If no row was updated, insert one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role);
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, user_role) TO authenticated;
