import { useState } from 'react';
import { DataTable, Column } from '@/components/crud/DataTable';
import { DeleteDialog } from '@/components/crud/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDatabaseCollection } from '@/hooks/useDatabaseCollection';
import { mockDepartments } from '@/lib/mockData';
import { Department } from '@/types';
import { toast } from 'sonner';

export function DepartmentManagement() {
  const { data: departments, addItem, updateItem, deleteItem } = useDatabaseCollection<Department>({
    collection: 'departments',
    initialData: mockDepartments,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteDeptId, setDeleteDeptId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    head: '',
    description: '',
    doctorCount: 0,
    nurseCount: 0,
  });

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.head.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Department>[] = [
    { key: 'name', header: 'Department', render: (d) => <span className="font-medium">{d.name}</span> },
    { key: 'head', header: 'Head' },
    { key: 'description', header: 'Description' },
    { key: 'doctorCount', header: 'Doctors' },
    { key: 'nurseCount', header: 'Nurses' },
  ];

  const handleAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', head: '', description: '', doctorCount: 0, nurseCount: 0 });
    setIsFormOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      head: dept.head,
      description: dept.description,
      doctorCount: dept.doctorCount,
      nurseCount: dept.nurseCount,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setDeleteDeptId(dept.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteDeptId) {
      deleteItem(deleteDeptId);
      toast.success('Department deleted successfully');
      setIsDeleteOpen(false);
      setDeleteDeptId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      updateItem(editingDept.id, formData);
      toast.success('Department updated successfully');
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        ...formData,
      };
      addItem(newDept);
      toast.success('Department created successfully');
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="Department Management"
        description="Manage hospital departments"
        data={filteredDepartments}
        columns={columns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or head..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonLabel="Add Department"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
            <DialogDescription>
              {editingDept ? 'Update department details.' : 'Create a new department.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="head">Department Head</Label>
                <Input
                  id="head"
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorCount">Doctors</Label>
                  <Input
                    id="doctorCount"
                    type="number"
                    min="0"
                    value={formData.doctorCount}
                    onChange={(e) => setFormData({ ...formData, doctorCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nurseCount">Nurses</Label>
                  <Input
                    id="nurseCount"
                    type="number"
                    min="0"
                    value={formData.nurseCount}
                    onChange={(e) => setFormData({ ...formData, nurseCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingDept ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Department"
        description="Are you sure you want to delete this department?"
      />
    </div>
  );
}
