/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Inbox = React.lazy(() => import('./pages/Inbox'));
const PredictiveHub = React.lazy(() => import('./pages/PredictiveHub'));
const ProtocolArchitect = React.lazy(() => import('./pages/ProtocolArchitect'));
const VisionLab = React.lazy(() => import('./pages/VisionLab'));
const HITL = React.lazy(() => import('./pages/HITL'));
const Skills = React.lazy(() => import('./pages/Skills'));
const KnowledgeBase = React.lazy(() => import('./pages/KnowledgeBase'));
const Tenants = React.lazy(() => import('./pages/Tenants'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/predictive" element={<PredictiveHub />} />
          <Route path="/protocols" element={<ProtocolArchitect />} />
          <Route path="/vision" element={<VisionLab />} />
          <Route path="/hitl" element={<HITL />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
