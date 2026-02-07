-- سياسة لمزودي الخدمة لرؤية ملفات المرضى الذين لديهم حجوزات عندهم
CREATE OR REPLACE FUNCTION public.provider_can_access_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.appointments a
    INNER JOIN public.providers p ON p.id = a.provider_id
    WHERE a.patient_id = _patient_id
      AND p.user_id = auth.uid()
  )
$$;

-- سياسات لمزودي الخدمة للاطلاع على ملفات المرضى
CREATE POLICY "Providers can view their patients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));

-- السماح لمزودي الخدمة برؤية حساسيات مرضاهم
CREATE POLICY "Providers can view their patients allergies"
ON public.allergies
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));

-- السماح لمزودي الخدمة برؤية الأمراض المزمنة لمرضاهم
CREATE POLICY "Providers can view their patients chronic diseases"
ON public.chronic_diseases
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));

-- السماح لمزودي الخدمة برؤية أدوية مرضاهم
CREATE POLICY "Providers can view their patients medications"
ON public.medications
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));

-- السماح لمزودي الخدمة برؤية التاريخ العائلي لمرضاهم
CREATE POLICY "Providers can view their patients family history"
ON public.family_history
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));

-- السماح لمزودي الخدمة برؤية وثائق مرضاهم
CREATE POLICY "Providers can view their patients medical documents"
ON public.medical_documents
FOR SELECT
TO authenticated
USING (public.provider_can_access_patient(user_id));