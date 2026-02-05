import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Loader2, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Allergy {
  id: string;
  allergy_name: string;
  severity: string | null;
  notes: string | null;
  created_at: string;
}

const severityLevels = [
  { value: 'mild', label: 'خفيفة', color: 'bg-success/15 text-success border-success/30' },
  { value: 'moderate', label: 'متوسطة', color: 'bg-warning/15 text-warning border-warning/30' },
  { value: 'severe', label: 'شديدة', color: 'bg-destructive/15 text-destructive border-destructive/30' },
];

export function Allergies({ userId }: { userId: string }) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    allergy_name: '',
    severity: '',
    notes: '',
  });

  useEffect(() => {
    fetchAllergies();
  }, [userId]);

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllergies(data || []);
    } catch (error: any) {
      console.error('Error fetching allergies:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.allergy_name.trim()) {
      toast.error('يرجى إدخال اسم الحساسية');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('allergies')
          .update({
            allergy_name: formData.allergy_name,
            severity: formData.severity || null,
            notes: formData.notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('تم تحديث البيانات');
      } else {
        const { error } = await supabase
          .from('allergies')
          .insert({
            user_id: userId,
            allergy_name: formData.allergy_name,
            severity: formData.severity || null,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success('تمت الإضافة بنجاح');
      }

      setDialogOpen(false);
      resetForm();
      fetchAllergies();
    } catch (error: any) {
      console.error('Error saving allergy:', error);
      toast.error('خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (allergy: Allergy) => {
    setEditingId(allergy.id);
    setFormData({
      allergy_name: allergy.allergy_name,
      severity: allergy.severity || '',
      notes: allergy.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('allergies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم الحذف');
      fetchAllergies();
    } catch (error: any) {
      console.error('Error deleting allergy:', error);
      toast.error('خطأ في الحذف');
    }
  };

  const resetForm = () => {
    setFormData({ allergy_name: '', severity: '', notes: '' });
    setEditingId(null);
  };

  const getSeverityBadge = (severity: string | null) => {
    const level = severityLevels.find(l => l.value === severity);
    if (!level) return null;
    return <Badge className={level.color}>{level.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          الحساسية
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة حساسية
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل' : 'إضافة'} حساسية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>نوع الحساسية *</Label>
                <Input
                  value={formData.allergy_name}
                  onChange={(e) => setFormData({ ...formData, allergy_name: e.target.value })}
                  placeholder="مثال: البنسلين، الفول السوداني"
                />
              </div>

              <div className="space-y-2">
                <Label>شدة الحساسية</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أعراض الحساسية، العلاج..."
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
        {allergies.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد حساسيات مسجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{allergy.allergy_name}</h4>
                    {getSeverityBadge(allergy.severity)}
                  </div>
                  {allergy.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{allergy.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(allergy)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(allergy.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
