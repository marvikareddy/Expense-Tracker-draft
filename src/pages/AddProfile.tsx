
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { familyService } from '@/services/familyService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const EMOJI_OPTIONS = ['👨', '👩', '👧', '👦', '🧔', '👱‍♀️', '👵', '👴', '🧒', '👶'];

const AddProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👨');
  const [age, setAge] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a name for the profile."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare the new family member data
      const newMember = {
        name,
        age: parseInt(age) || 0,
        image: selectedEmoji,
        isParent,
        allowance: isParent ? 0 : parseFloat(allowance) || 0,
        savings: 0
      };
      
      // Add the new family member
      await familyService.addFamilyMember(user?.id || '', newMember);
      
      toast({
        title: "Success",
        description: `${name}'s profile has been created.`
      });
      
      navigate('/profiles');
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create profile. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center px-4 pt-12">
      <div className="mb-8 flex items-center">
        <ShieldCheck className="h-8 w-8 text-purple-500 mr-2" />
        <h1 className="text-3xl font-bold text-white">ExpenSmart</h1>
      </div>
      
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="text-white mb-6"
          onClick={() => navigate('/profiles')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to profiles
        </Button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Create a New Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 border-2 border-purple-500">
              <AvatarFallback className="text-4xl bg-purple-600 text-white">
                {selectedEmoji}
              </AvatarFallback>
            </Avatar>
            
            <div className="grid grid-cols-5 gap-2 mt-4">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                    selectedEmoji === emoji ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age" className="text-white">Age</Label>
              <Input 
                id="age" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                type="number"
                min="0"
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter age"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="isParent" className="text-white">Is this a parent profile?</Label>
              <Switch
                id="isParent"
                checked={isParent}
                onCheckedChange={setIsParent}
              />
            </div>
            
            {!isParent && (
              <div>
                <Label htmlFor="allowance" className="text-white">Weekly Allowance</Label>
                <Input 
                  id="allowance" 
                  value={allowance} 
                  onChange={(e) => setAllowance(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter weekly allowance amount"
                />
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProfile;
