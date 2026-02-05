import { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Loader2, 
  Upload, 
  Trash2, 
  Eye, 
  Calendar,
  Download,
  Image,
  File,
  X
} from 'lucide-react';
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

interface MedicalDocument {
  id: string;
  title: string;
  document_type: string;
  description: string | null;
  file_url: string;
  doctor_name: string | null;
  document_date: string | null;
  created_at: string;
}

const documentTypes = [
  { value: 'report', label: 'تقرير طبي' },
  { value: 'lab_result', label: 'نتيجة تحليل' },
  { value: 'xray', label: 'صورة أشعة' },
  { value: 'prescription', label: 'وصفة طبية' },
  { value: 'scan', label: 'صورة طبقي محوري' },
  { value: 'mri', label: 'صورة رنين مغناطيسي' },
  { value: 'other', label: 'أخرى' },
];

export function MedicalDocuments({ userId }: { userId: string }) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    document_type: '',
    description: '',
    doctor_name: '',
    document_date: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('خطأ في جلب الوثائق');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 10 ميغابايت');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title || !formData.document_type) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-records')
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from('medical_documents')
        .insert({
          user_id: userId,
          title: formData.title,
          document_type: formData.document_type,
          description: formData.description || null,
          doctor_name: formData.doctor_name || null,
          document_date: formData.document_date || null,
          file_url: publicUrl,
        });

      if (insertError) throw insertError;

      toast.success('تم رفع الوثيقة بنجاح');
      setDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('خطأ في رفع الوثيقة');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: MedicalDocument) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) return;

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('medical-records').remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast.success('تم حذف الوثيقة');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('خطأ في حذف الوثيقة');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      document_type: '',
      description: '',
      doctor_name: '',
      document_date: '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type;
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
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
          <FileText className="h-5 w-5 text-primary" />
          الوثائق والتقارير الطبية
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة وثيقة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>رفع وثيقة طبية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>الملف *</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      {getFileIcon(selectedFile.name)}
                      <span className="text-sm">{selectedFile.name}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">اضغط لاختيار ملف</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, صور، أو وثائق (حد أقصى 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="space-y-2">
                <Label>عنوان الوثيقة *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: تحليل دم شامل"
                />
              </div>

              <div className="space-y-2">
                <Label>نوع الوثيقة *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>اسم الطبيب</Label>
                <Input
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="د. أحمد محمد"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ الوثيقة</Label>
                <Input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    رفع الوثيقة
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد وثائق طبية</p>
            <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة وثائقك الطبية</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(doc.file_url)}
                    <h4 className="font-medium line-clamp-1">{doc.title}</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getDocumentTypeLabel(doc.document_type)}
                  </Badge>
                </div>

                {doc.doctor_name && (
                  <p className="text-sm text-muted-foreground mb-1">
                    الطبيب: {doc.doctor_name}
                  </p>
                )}

                {doc.document_date && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <Calendar className="h-3 w-3" />
                    {doc.document_date}
                  </p>
                )}

                {doc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {doc.description}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(doc.file_url, '_blank')}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(doc)}
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
