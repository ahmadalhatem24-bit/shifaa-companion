import { useEffect, useState } from 'react';
import { Pill, Plus, Loader2, Trash2, Edit2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
}

export function Medications({ userId }: { userId: string }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    fetchMedications();
  }, [userId]);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.medication_name.trim()) {
      toast.error('يرجى إدخال اسم الدواء');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('medications')
          .update({
            medication_name: formData.medication_name,
            dosage: formData.dosage || null,
            frequency: formData.frequency || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            is_active: formData.is_active,
            notes: formData.notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('تم تحديث البيانات');
      } else {
        const { error } = await supabase
          .from('medications')
          .insert({
            user_id: userId,
            medication_name: formData.medication_name,
            dosage: formData.dosage || null,
            frequency: formData.frequency || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            is_active: formData.is_active,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success('تمت الإضافة بنجاح');
      }

      setDialogOpen(false);
      resetForm();
      fetchMedications();
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast.error('خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingId(medication.id);
    setFormData({
      medication_name: medication.medication_name,
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      start_date: medication.start_date || '',
      end_date: medication.end_date || '',
      is_active: medication.is_active ?? true,
      notes: medication.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم الحذف');
      fetchMedications();
    } catch (error: any) {
      console.error('Error deleting medication:', error);
      toast.error('خطأ في الحذف');
    }
  };

  const toggleActive = async (medication: Medication) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ is_active: !medication.is_active })
        .eq('id', medication.id);

      if (error) throw error;
      fetchMedications();
    } catch (error: any) {
      console.error('Error updating medication:', error);
      toast.error('خطأ في التحديث');
    }
  };

  const resetForm = () => {
    setFormData({
      medication_name: '',
      dosage: '',
      frequency: '',
      start_date: '',
      end_date: '',
      is_active: true,
      notes: '',
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeMeds = medications.filter(m => m.is_active);
  const inactiveMeds = medications.filter(m => !m.is_active);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-success" />
          الأدوية
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة دواء
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل' : 'إضافة'} دواء</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>اسم الدواء *</Label>
                <Input
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  placeholder="مثال: باراسيتامول"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الجرعة</Label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="مثال: 500 ملغ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>التكرار</Label>
                  <Input
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="مثال: مرتين يومياً"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ البدء</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <Label>الدواء فعال حالياً</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="تعليمات الاستخدام..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد أدوية مسجلة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeMeds.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  الأدوية الفعالة ({activeMeds.length})
                </h4>
                <div className="space-y-3">
                  {activeMeds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={toggleActive}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveMeds.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  الأدوية السابقة ({inactiveMeds.length})
                </h4>
                <div className="space-y-3 opacity-70">
                  {inactiveMeds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={toggleActive}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MedicationCard({ 
  medication, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  medication: Medication; 
  onEdit: (m: Medication) => void; 
  onDelete: (id: string) => void;
  onToggle: (m: Medication) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{medication.medication_name}</h4>
          {medication.is_active && (
            <Badge className="bg-success/15 text-success border-success/30">فعال</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
          {medication.dosage && <span>الجرعة: {medication.dosage}</span>}
          {medication.frequency && <span>• {medication.frequency}</span>}
        </div>
        {(medication.start_date || medication.end_date) && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            {medication.start_date && `من ${medication.start_date}`}
            {medication.end_date && ` إلى ${medication.end_date}`}
          </p>
        )}
        {medication.notes && (
          <p className="text-sm text-muted-foreground mt-1">{medication.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={medication.is_active ?? false}
          onCheckedChange={() => onToggle(medication)}
        />
        <Button variant="ghost" size="icon" onClick={() => onEdit(medication)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(medication.id)}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
