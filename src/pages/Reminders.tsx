import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Skeleton } from '../app/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../app/components/ui/dialog';
import { ArrowLeft, Bell, Plus, Trash2, Edit, Clock, Calendar, Pill, AlertCircle, CheckCircle } from 'lucide-react';
import { reminderApi, type Reminder, getErrorMessage } from '../services/api';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Reminders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Form state
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('twice');
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('21:00');
  const [time3, setTime3] = useState('13:00');
  const [time4, setTime4] = useState('17:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load reminders from API on mount
  useEffect(() => {
    if (!user) return;
    reminderApi.getAll()
      .then(data => setReminders(data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  const resetForm = () => {
    setMedicineName('');
    setDosage('');
    setFrequency('twice');
    setTime1('09:00');
    setTime2('21:00');
    setTime3('13:00');
    setTime4('17:00');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setInstructions('');
    setEditingReminder(null);
  };

  const handleCreateReminder = async () => {
    if (!medicineName.trim() || !dosage.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const times: string[] = [];
    if (frequency === 'once')       times.push(time1);
    if (frequency === 'twice')      times.push(time1, time2);
    if (frequency === 'thrice')     times.push(time1, time2, time3);
    if (frequency === 'four-times') times.push(time1, time2, time3, time4);

    const payload = {
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate: endDate || undefined,
      instructions: instructions || undefined,
      active: true,
    };

    setSubmitting(true);
    try {
      if (editingReminder) {
        const updated = await reminderApi.update(editingReminder._id, payload);
        setReminders(prev => prev.map(r => r._id === editingReminder._id ? updated : r));
        toast.success('Reminder updated successfully');
      } else {
        const created = await reminderApi.create(payload);
        setReminders(prev => [...prev, created]);
        toast.success('Reminder created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setMedicineName(reminder.medicineName);
    setDosage(reminder.dosage);
    setFrequency(reminder.frequency);
    setTime1(reminder.times[0] || '09:00');
    setTime2(reminder.times[1] || '21:00');
    setTime3(reminder.times[2] || '13:00');
    setTime4(reminder.times[3] || '17:00');
    setStartDate(reminder.startDate);
    setEndDate(reminder.endDate || '');
    setInstructions(reminder.instructions || '');
    setIsDialogOpen(true);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await reminderApi.delete(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Reminder deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await reminderApi.toggle(id);
      setReminders(prev => prev.map(r => r._id === id ? updated : r));
      toast.success('Reminder status updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Statistics for charts
  const activeReminders   = reminders.filter(r => r.active).length;
  const inactiveReminders = reminders.length - activeReminders;

  const frequencyData = [
    { name: 'Once Daily',       value: reminders.filter(r => r.frequency === 'once').length,       color: '#1E88E5' },
    { name: 'Twice Daily',      value: reminders.filter(r => r.frequency === 'twice').length,      color: '#00A86B' },
    { name: 'Thrice Daily',     value: reminders.filter(r => r.frequency === 'thrice').length,     color: '#FF9800' },
    { name: 'Four Times Daily', value: reminders.filter(r => r.frequency === 'four-times').length, color: '#AB47BC' },
  ].filter(item => item.value > 0);

  const timeDistributionData = [
    { time: '6-9 AM',   count: 0 },
    { time: '9-12 PM',  count: 0 },
    { time: '12-3 PM',  count: 0 },
    { time: '3-6 PM',   count: 0 },
    { time: '6-9 PM',   count: 0 },
    { time: '9-12 AM',  count: 0 },
  ];

  reminders.forEach(reminder => {
    reminder.times.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      if (hour >= 6  && hour < 9)  timeDistributionData[0].count++;
      else if (hour >= 9  && hour < 12) timeDistributionData[1].count++;
      else if (hour >= 12 && hour < 15) timeDistributionData[2].count++;
      else if (hour >= 15 && hour < 18) timeDistributionData[3].count++;
      else if (hour >= 18 && hour < 21) timeDistributionData[4].count++;
      else                               timeDistributionData[5].count++;
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Bell className="h-8 w-8" />
                  Medication Reminders
                </h1>
                <p className="text-blue-100 mt-1">Never miss your medication schedule</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary hover:bg-blue-50">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-primary text-2xl flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up medication reminders to stay on track with your treatment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicine-name" className="text-primary">Medicine Name *</Label>
                      <Input
                        id="medicine-name"
                        placeholder="e.g., Paracetamol"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage" className="text-primary">Dosage *</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 500mg"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="frequency" className="text-primary">Frequency *</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="border-primary/30 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once a day</SelectItem>
                        <SelectItem value="twice">Twice a day</SelectItem>
                        <SelectItem value="thrice">Three times a day</SelectItem>
                        <SelectItem value="four-times">Four times a day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {frequency === 'once' && (
                      <div>
                        <Label htmlFor="time1" className="text-primary">Time</Label>
                        <Input id="time1" type="time" value={time1} onChange={(e) => setTime1(e.target.value)} className="border-primary/30" />
                      </div>
                    )}
                    {(frequency === 'twice' || frequency === 'thrice' || frequency === 'four-times') && (
                      <>
                        <div>
                          <Label htmlFor="time1" className="text-primary">Time 1</Label>
                          <Input id="time1" type="time" value={time1} onChange={(e) => setTime1(e.target.value)} className="border-primary/30" />
                        </div>
                        <div>
                          <Label htmlFor="time2" className="text-primary">Time 2</Label>
                          <Input id="time2" type="time" value={time2} onChange={(e) => setTime2(e.target.value)} className="border-primary/30" />
                        </div>
                      </>
                    )}
                    {(frequency === 'thrice' || frequency === 'four-times') && (
                      <div>
                        <Label htmlFor="time3" className="text-primary">Time 3</Label>
                        <Input id="time3" type="time" value={time3} onChange={(e) => setTime3(e.target.value)} className="border-primary/30" />
                      </div>
                    )}
                    {frequency === 'four-times' && (
                      <div>
                        <Label htmlFor="time4" className="text-primary">Time 4</Label>
                        <Input id="time4" type="time" value={time4} onChange={(e) => setTime4(e.target.value)} className="border-primary/30" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-primary">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-primary">End Date (Optional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-primary">Special Instructions (Optional)</Label>
                    <Input
                      id="instructions"
                      placeholder="e.g., Take with food, after meals"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="border-primary/30"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateReminder}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={submitting}
                    >
                      {submitting
                        ? 'Saving…'
                        : editingReminder ? 'Update Reminder' : 'Create Reminder'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setIsDialogOpen(false); resetForm(); }}
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Total Reminders', value: reminders.length, icon: Bell,         color: 'text-primary', borderColor: 'border-primary/20', desc: 'Active medication schedules' },
            { title: 'Active',           value: activeReminders,   icon: CheckCircle,  color: 'text-secondary', borderColor: 'border-secondary/20', desc: 'Currently enabled' },
            { title: 'Inactive',         value: inactiveReminders, icon: AlertCircle,  color: 'text-accent',    borderColor: 'border-accent/20',    desc: 'Paused or disabled' },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <Card className={`${stat.borderColor} shadow-lg`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center gap-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading
                    ? <Skeleton className="h-10 w-16" />
                    : <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                  }
                  <p className="text-sm text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        {reminders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Frequency Distribution
                  </CardTitle>
                  <CardDescription>How often you take medications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={frequencyData}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {frequencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Time Distribution
                  </CardTitle>
                  <CardDescription>When you take your medications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" stroke="#1E88E5" />
                      <YAxis stroke="#1E88E5" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #1E88E5', borderRadius: '12px' }} />
                      <Bar dataKey="count" fill="#1E88E5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Reminders List */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Pill className="h-5 w-5" /> Your Medication Schedule
            </CardTitle>
            <CardDescription>Manage all your medication reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Reminders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first medication reminder to stay on track
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Reminder
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-l-4 ${reminder.active ? 'border-l-primary bg-blue-50/30' : 'border-l-gray-300 bg-gray-50'}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Pill className={`h-6 w-6 ${reminder.active ? 'text-primary' : 'text-gray-400'}`} />
                              <div>
                                <h3 className={`text-xl font-semibold ${reminder.active ? 'text-primary' : 'text-gray-500'}`}>
                                  {reminder.medicineName}
                                </h3>
                                <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                              </div>
                              <Badge
                                variant={reminder.active ? 'default' : 'secondary'}
                                className={reminder.active ? 'bg-secondary' : ''}
                              >
                                {reminder.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium text-primary">Frequency:</span>
                                <span className="text-muted-foreground">
                                  {reminder.frequency === 'once'       && 'Once daily'}
                                  {reminder.frequency === 'twice'      && 'Twice daily'}
                                  {reminder.frequency === 'thrice'     && 'Three times daily'}
                                  {reminder.frequency === 'four-times' && 'Four times daily'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Bell className="h-4 w-4 text-primary" />
                                <span className="font-medium text-primary">Times:</span>
                                <span className="text-muted-foreground">{reminder.times.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="font-medium text-primary">Duration:</span>
                                <span className="text-muted-foreground">
                                  {new Date(reminder.startDate).toLocaleDateString()} –{' '}
                                  {reminder.endDate
                                    ? new Date(reminder.endDate).toLocaleDateString()
                                    : 'Ongoing'}
                                </span>
                              </div>
                            </div>

                            {reminder.instructions && (
                              <div className="bg-blue-50 border border-primary/20 rounded-lg p-3 text-sm">
                                <span className="font-medium text-primary">Instructions: </span>
                                <span className="text-muted-foreground">{reminder.instructions}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(reminder._id)}
                              className={reminder.active ? 'text-secondary hover:bg-secondary/10' : 'text-gray-400 hover:bg-gray-100'}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditReminder(reminder)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReminder(reminder._id)}
                              className="text-accent hover:bg-accent/10"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Helpful Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Set reminders at times when you\'re usually awake and at home',
                  'Enable browser notifications to receive alerts even when the app is closed',
                  'Add special instructions like "with food" or "before meals" to help you remember',
                  'Set an end date for short-term medications to automatically stop reminders',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
