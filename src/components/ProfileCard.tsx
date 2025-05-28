
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { motion } from '@/components/ui/motion';
import { useToast } from "@/hooks/use-toast";
import { familyService, FamilyMember } from '@/services/familyService';

interface ProfileCardProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  onUpdate: () => void;
  showActions?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  member, 
  onSelect, 
  onUpdate, 
  showActions = true 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: member.name,
    age: member.age,
    allowance: member.allowance,
    isParent: member.isParent,
    image: member.image
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name is required"
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('Starting edit for member:', member.id, editData);
      
      await familyService.updateFamilyMember(member.id, {
        name: editData.name.trim(),
        age: editData.age,
        allowance: editData.allowance,
        isParent: editData.isParent,
        image: editData.image
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete ${member.name}'s profile? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log('Starting delete for member:', member.id);
      
      // Delete from database
      await familyService.deleteFamilyMember(member.id);
      
      // Clear selected profile if it's the one being deleted
      const selectedProfile = localStorage.getItem('selectedProfile');
      if (selectedProfile) {
        const parsed = JSON.parse(selectedProfile);
        if (parsed.id === member.id) {
          localStorage.removeItem('selectedProfile');
        }
      }
      
      // Clear any local storage data for this member
      const expenseKey = `expenses_${member.id}`;
      const rewardKey = `rewards_${member.id}`;
      localStorage.removeItem(expenseKey);
      localStorage.removeItem(rewardKey);
      
      toast({
        title: "Success",
        description: `${member.name}'s profile has been deleted`
      });
      
      // Trigger update to refresh the profiles list
      onUpdate();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete profile. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditData({
      name: member.name,
      age: member.age,
      allowance: member.allowance,
      isParent: member.isParent,
      image: member.image
    });
    setIsEditing(true);
  };

  const emojiOptions = ['👤', '👨', '👩', '👦', '👧', '🧑', '👶', '👴', '👵', '🤠', '🤓', '😎'];

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center cursor-pointer"
        onClick={() => onSelect(member)}
      >
        <Avatar className="w-28 h-28 border-4 border-transparent hover:border-purple-500 transition-all duration-300">
          {member.image.startsWith('http') ? (
            <AvatarImage src={member.image} alt={member.name} />
          ) : (
            <AvatarFallback className="text-5xl bg-purple-600 text-white">
              {member.image}
            </AvatarFallback>
          )}
        </Avatar>
        <p className="mt-3 text-lg font-medium text-white">{member.name}</p>
        {member.isParent && (
          <span className="mt-1 text-xs text-purple-400">Parent</span>
        )}
      </motion.div>

      {showActions && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 h-8 w-8 p-0"
                onClick={handleEditClick}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white border-gray-700" onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Edit {member.name}'s Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-age">Age</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    min="0"
                    max="150"
                    value={editData.age}
                    onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-allowance">Allowance</Label>
                  <Input
                    id="edit-allowance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.allowance}
                    onChange={(e) => setEditData(prev => ({ ...prev, allowance: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-parent"
                    checked={editData.isParent}
                    onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isParent: checked }))}
                  />
                  <Label htmlFor="edit-parent">Is Parent</Label>
                </div>
                <div>
                  <Label>Profile Image</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditData(prev => ({ ...prev, image: emoji }));
                        }}
                        className={`p-2 text-2xl rounded border-2 transition-colors ${
                          editData.image === emoji 
                            ? 'border-purple-500 bg-purple-600/20' 
                            : 'border-gray-600 hover:border-purple-400'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <DialogClose asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 h-8 w-8 p-0"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
