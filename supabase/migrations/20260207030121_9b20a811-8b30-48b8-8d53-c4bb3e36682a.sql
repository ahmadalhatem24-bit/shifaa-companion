-- إضافة دالة للتحقق من دور المستخدم (للاستخدام في سياسات RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- إضافة سياسات للمدير للوصول لجميع البيانات

-- سياسة المدير للملفات الشخصية
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير لأدوار المستخدمين
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير لمزودي الخدمة
CREATE POLICY "Admins can update all providers"
ON public.providers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete providers"
ON public.providers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert providers"
ON public.providers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير للمواعيد
CREATE POLICY "Admins can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير للتقييمات
CREATE POLICY "Admins can update all reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير للمحادثات والرسائل
CREATE POLICY "Admins can view all conversations"
ON public.ai_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all messages"
ON public.ai_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة المدير للسجلات الطبية
CREATE POLICY "Admins can view all allergies"
ON public.allergies
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all chronic diseases"
ON public.chronic_diseases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medications"
ON public.medications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all family history"
ON public.family_history
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medical documents"
ON public.medical_documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));