import React, { useState } from 'react';
import Header from '../Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '../../hooks/use-toast';
import { User, Mail, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
      } else {
        toast({
          title: "Update failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="md:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Profile Information
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-white hover:bg-gray-800"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-red-600 text-white text-2xl">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white text-lg font-semibold">{user?.name}</h3>
                  <p className="text-gray-400">{user?.email}</p>
                  <p className="text-gray-500 text-sm">Member since {new Date(user?.created_at).getFullYear()}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-gray-800 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 bg-gray-800 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                >
                  Download Data
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Watchlist Items</span>
                  <span className="text-white font-semibold">{user?.watchlist?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className="text-white font-semibold">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white font-semibold">
                    {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile Views</span>
                  <span className="text-white font-semibold">1,247</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;