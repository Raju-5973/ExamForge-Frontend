import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '../utils/api';
import { Target, Activity, GraduationCap } from 'lucide-react';

const OBEMapping = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOBEData();
  }, []);

  const fetchOBEData = async () => {
    try {
      const response = await api.get('/api/questions/');
      const questions = response.data;

      // CO Mapping
      const coMap = { 'CO1': 0, 'CO2': 0, 'CO3': 0, 'CO4': 0, 'CO5': 0 };
      questions.forEach(q => {
        if (q.co_mapping) {
          const cos = q.co_mapping.split(',').map(s => s.trim().toUpperCase());
          cos.forEach(co => {
            if (coMap[co] !== undefined) coMap[co]++;
          });
        }
      });
      const coData = Object.keys(coMap).map(k => ({ subject: k, A: coMap[k], fullMark: Math.max(...Object.values(coMap)) || 10 }));

      // PO Mapping
      const poMap = {};
      for (let i = 1; i <= 12; i++) poMap[`PO${i}`] = 0;
      
      questions.forEach(q => {
        if (q.po_mapping) {
          const pos = q.po_mapping.split(',').map(s => s.trim().toUpperCase());
          pos.forEach(po => {
            if (poMap[po] !== undefined) poMap[po]++;
          });
        }
      });
      const poData = Object.keys(poMap).map(k => ({ name: k, count: poMap[k] }));

      setStats({
        totalMapped: questions.filter(q => q.co_mapping || q.po_mapping).length,
        totalQuestions: questions.length,
        coData,
        poData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const mappedPercentage = stats?.totalQuestions ? Math.round((stats.totalMapped / stats.totalQuestions) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">OBE Mapping Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Outcome-Based Education alignment across the question bank.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Mapped Questions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalMapped || 0}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Bank Coverage</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{mappedPercentage}%</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total POs Tracked</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Outcomes (CO) Attainment</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats?.coData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar name="Questions" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program Outcomes (PO) Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.poData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Questions per PO" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OBEMapping;
