import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CalendarClock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Brand from '@/components/Brand';
import ActionButton from '@/components/common/ActionButton';
import PreferencesForm from '@/components/settings/PreferencesForm';
import { LoadingBlock } from '@/components/common/Loading';
import { buildSchedule, planSummary } from '@/lib/plan';
import { daysUntil } from '@/lib/srs';

export default function Onboarding() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [mastery, setMastery] = useState([]);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.LearnerProfile.list({ limit: 1 }),
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
      base44.entities.TopicMastery.list({ limit: 50 }),
      base44.entities.RevisionItem.count({ status: 'open' }),
    ])