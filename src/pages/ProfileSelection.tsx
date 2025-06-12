
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Users, ArrowRight, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { familyService } from '@/services/familyService';
import { useToast } from '@/hooks/use-toast';

const ProfileSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, getCurrencySymbol } = useCurrency();
  const { convertAmount } = useCurrencyConversion();
  const currencySymbol = getCurrencySymbol();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      if (user) {
        try {
          setIsLoading(true);
          console.log('Loading family members for user:', user.id);
          
          const members = await familyService.getFamilyMembers(user.id);
          console.log('Loaded family members:', members);
          
          // Convert allowance and savings to current currency
          const convertedMembers = await Promise.all(
            members.map(async (member) => {
              const convertedAllowance = await convertAmount(member.allowance, 'USD');
              const convertedSavings = await convertAmount(member.savings, 'USD');
              return {
                ...member,
                allowance: convertedAllowance,
                savings: convertedSavings
              };
            })
          );
          
          setProfiles(convertedMembers);
        } catch (error) {
          console.error("Error loading profiles:", error);
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
    
    loadProfiles();
  }, [user, currency, convertAmount, toast]);

  const handleSelectProfile = (profile: any) => {
    console.log('Selected profile:', profile);
    
    // Store the selected profile in localStorage for reference
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    
    if (profile.isParent) {
      navigate('/parent');
    } else {
      navigate('/child');
    }
  };

  const handleAddProfile = () => {
    navigate('/add-profile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="container py-12 text-white">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-300">Loading family profiles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="container py-12 text-white">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Your Profile</h1>
          <p className="text-xl text-gray-300">Choose a family member to continue</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {profiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group"
              onClick={() => handleSelectProfile(profile)}
            >
              <CardHeader className="text-center border-b border-gray-700">
                <Avatar className="w-20 h-20 mx-auto mb-4 group-hover:scale-105 transition-transform">
                  {profile.image.startsWith('http') ? (
                    <AvatarImage src={profile.image} />
                  ) : (
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {profile.image}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-white">{profile.name}</CardTitle>
                <p className="text-gray-400">
                  {profile.isParent ? 'Parent' : `Age ${profile.age}`}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pocket Money:</span>
                    <span className="text-white font-medium">
                      {currencySymbol}{profile.allowance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Savings:</span>
                    <span className="text-white font-medium">
                      {currencySymbol}{profile.savings.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-500"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="bg-gray-800 border-gray-700 border-dashed hover:border-purple-500 transition-colors cursor-pointer group"
            onClick={handleAddProfile}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <PlusCircle className="h-16 w-16 text-gray-400 group-hover:text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Add New Profile</h3>
              <p className="text-gray-400 text-center">Create a new family member profile</p>
            </CardContent>
          </Card>
        </div>
        
        {profiles.length === 0 && (
          <div className="text-center mt-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">No Profiles Yet</h2>
            <p className="text-gray-400 mb-8">Get started by creating your first family profile</p>
            <Button 
              onClick={handleAddProfile}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create First Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelection;
