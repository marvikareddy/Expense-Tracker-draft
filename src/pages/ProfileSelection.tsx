
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldCheck } from 'lucide-react';
import { motion } from '@/components/ui/motion';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { familyService } from '@/services/familyService';

const ProfileSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const members = await familyService.getFamilyMembers(user.id);
          setFamilyMembers(members);
        } catch (error) {
          console.error("Error loading family members:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load family profiles."
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFamilyMembers();
  }, [user, toast]);

  const handleProfileSelect = (member: any) => {
    // Store the selected profile in localStorage or session for reference
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
      
      <h2 className="text-2xl font-bold text-white mb-10">Who's managing expenses today?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse">
              <div className="w-28 h-28 rounded-full bg-gray-700 mb-3"></div>
              <div className="h-5 w-20 bg-gray-700 rounded"></div>
            </div>
          ))
        ) : (
          familyMembers.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleProfileSelect(member)}
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
          ))
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center cursor-pointer"
          onClick={handleAddProfile}
        >
          <div className="w-28 h-28 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center hover:border-purple-500 transition-all duration-300">
            <PlusCircle className="w-12 h-12 text-gray-500 hover:text-purple-500 transition-all duration-300" />
          </div>
          <p className="mt-3 text-lg font-medium text-white">Add Profile</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSelection;
