
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldCheck, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { familyService, FamilyMember } from '@/services/familyService';
import { resetService } from '@/services/resetService';
import ProfileCard from '@/components/ProfileCard';

const ProfileSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadFamilyMembers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Loading family members for user:', user.id);
      
      const members = await familyService.getFamilyMembers(user.id);
      setFamilyMembers(members);
      
      console.log('Loaded family members:', members);
    } catch (error) {
      console.error("Error loading family members:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load family profiles. Please try again."
      });
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log('Updating family members list');
      await loadFamilyMembers();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!user || isResetting) return;
    
    if (!confirm('⚠️ WARNING: This will DELETE ALL DATA from the entire database, not just your account. This includes all users, family members, expenses, and settings. This action CANNOT be undone. Are you absolutely sure you want to proceed?')) {
      return;
    }
    
    // Double confirmation for complete reset
    if (!confirm('This is your final warning. You are about to delete EVERYTHING in the database. Type YES in your mind and click OK only if you want to proceed with the complete reset.')) {
      return;
    }
    
    try {
      setIsResetting(true);
      console.log('Resetting entire database');
      
      await resetService.resetAllAccountData(user.id);
      
      toast({
        title: "Complete Database Reset",
        description: "All data has been permanently deleted from the database. You can now start fresh."
      });
      
      // Clear all localStorage
      localStorage.clear();
      
      // Reload the family members to show empty state
      await loadFamilyMembers();
    } catch (error) {
      console.error("Error resetting database:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to reset the database. Please try again."
      });
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    loadFamilyMembers();
  }, [user]);

  const handleProfileSelect = (member: FamilyMember) => {
    console.log('Profile selected:', member);
    
    // Store the selected profile in localStorage for reference
    localStorage.setItem('selectedProfile', JSON.stringify(member));
    
    // Navigate to the appropriate dashboard based on isParent flag
    if (member.isParent) {
      navigate('/parent');
    } else {
      navigate('/child');
    }
  };

  const handleAddProfile = () => {
    navigate('/add-profile');
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center px-4">
      <div className="mb-12 flex items-center">
        <ShieldCheck className="h-10 w-10 text-purple-500 mr-3" />
        <h1 className="text-4xl font-bold text-white">ExpenSmart</h1>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6">Who's managing expenses today?</h2>
      
      {/* Complete Reset Button */}
      <div className="mb-6">
        <Button 
          onClick={handleReset}
          disabled={isResetting}
          variant="outline"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {isResetting ? 'Resetting Database...' : 'Complete Database Reset'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse">
              <div className="w-28 h-28 rounded-full bg-gray-700 mb-3"></div>
              <div className="h-5 w-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 p-10 border-4 border-dashed border-gray-600 rounded-full">
            <PlusCircle className="w-20 h-20 text-gray-500" />
          </div>
          <p className="text-xl text-gray-400 mb-4">No family members yet</p>
          <p className="text-gray-500 mb-8 max-w-md">Start by adding family members to track expenses and manage allowances together</p>
          <Button 
            onClick={handleAddProfile} 
            className="bg-purple-600 hover:bg-purple-700 flex items-center"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Family Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {familyMembers.map((member) => (
            <ProfileCard
              key={member.id}
              member={member}
              onSelect={handleProfileSelect}
              onUpdate={handleUpdate}
              showActions={true}
            />
          ))}
          
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={handleAddProfile}
          >
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center hover:border-purple-500 transition-all duration-300">
              <PlusCircle className="w-12 h-12 text-gray-500 hover:text-purple-500 transition-all duration-300" />
            </div>
            <p className="mt-3 text-lg font-medium text-white">Add Profile</p>
          </div>
        </div>
      )}
      
      {isUpdating && (
        <div className="mt-4 text-purple-400 text-sm">
          Updating profiles...
        </div>
      )}
    </div>
  );
};

export default ProfileSelection;
