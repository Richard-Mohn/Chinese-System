'use client';

import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheckCircle, FaChevronRight, FaRegClock, FaTimes, FaUserTie } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { ECOSYSTEM_ROLES, type EcosystemRole } from '@/lib/careers/roles';
import { getQuestionsForRole } from '@/lib/careers/applicationQuestions';

interface QuickApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleSlug?: string;
}

export default function QuickApplicationModal({ isOpen, onClose, defaultRoleSlug }: QuickApplicationModalProps) {
  const defaultRole = ECOSYSTEM_ROLES.find(role => role.slug === defaultRoleSlug) || null;
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>(defaultRole?.slug || '');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: 'VA',
    linkedinUrl: '',
    facebookUrl: '',
    xUrl: '',
    interviewReady: false,
    independentContractorAck: false,
    backgroundCheckConsent: false,
    notes: '',
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const selectedRole = useMemo(
    () => ECOSYSTEM_ROLES.find(role => role.slug === selectedRoleSlug) || null,
    [selectedRoleSlug]
  );

  const roleQuestions = useMemo(() => {
    if (!selectedRole) return [];
    return getQuestionsForRole(selectedRole);
  }, [selectedRole]);

  const requiresBackgroundCheck = selectedRole
    ? ['delivery', 'hospitality', 'operations'].includes(selectedRole.category)
    : false;

  const resetAndClose = () => {
    setDone(false);
    setError('');
    onClose();
  };

  const setField = (name: string, value: string | boolean) => setForm(prev => ({ ...prev, [name]: value }));

  const onSubmit = async () => {
    setError('');

    if (!selectedRole) {
      setError('Please choose a role before submitting.');
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.city || !form.state) {
      setError('Please complete the required contact fields.');
      return;
    }

    const missingRequired = roleQuestions.find(question => question.required && !answers[question.id]);
    if (missingRequired) {
      setError(`Please complete: ${missingRequired.label}`);
      return;
    }

    if (!form.interviewReady || !form.independentContractorAck) {
      setError('Please confirm interview readiness and platform terms.');
      return;
    }

    if (requiresBackgroundCheck && !form.backgroundCheckConsent) {
      setError('Background check consent is required for this role.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'careerApplications'), {
        roleSlug: selectedRole.slug,
        roleTitle: selectedRole.title,
        category: selectedRole.category,
        candidate: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          state: form.state,
          social: {
            linkedinUrl: form.linkedinUrl || null,
            facebookUrl: form.facebookUrl || null,
            xUrl: form.xUrl || null,
          },
        },
        answers,
        notes: form.notes || null,
        legal: {
          interviewReady: form.interviewReady,
          independentContractorAck: form.independentContractorAck,
          backgroundCheckConsent: requiresBackgroundCheck ? form.backgroundCheckConsent : null,
        },
        status: 'new',
        source: 'quick-application-modal',
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch {
      setError('Unable to submit right now. Please try again in a minute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-black/50 backdrop-blur-[2px]"
            onClick={resetAndClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-210 mx-auto w-[95%] max-w-4xl max-h-[90vh] overflow-hidden rounded-4xl border border-zinc-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Fast Application</div>
                <h2 className="text-xl font-black text-zinc-900">Quick Apply</h2>
              </div>
              <button onClick={resetAndClose} title="Close quick application modal" className="w-9 h-9 rounded-xl border border-zinc-200 grid place-items-center text-zinc-500 hover:text-zinc-900">
                <FaTimes />
              </button>
            </div>

            {done ? (
              <div className="p-10 text-center">
                <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-zinc-900 mb-2">Application Received</h3>
                <p className="text-zinc-500 max-w-xl mx-auto">
                  Thanks for applying. Our team reviews applications quickly and reaches out fast for the next step.
                </p>
                <button onClick={resetAndClose} className="mt-6 px-7 py-3 rounded-full bg-black text-white font-bold hover:bg-zinc-800">
                  Close
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(90vh-5.25rem)] p-6 md:p-8 space-y-7">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Select role</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ECOSYSTEM_ROLES.map(role => {
                      const active = role.slug === selectedRoleSlug;
                      return (
                        <button
                          key={role.slug}
                          onClick={() => setSelectedRoleSlug(role.slug)}
                          className={`text-left rounded-2xl border p-4 transition-all ${
                            active ? 'border-emerald-300 bg-emerald-50/70' : 'border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{role.badge}</div>
                          <div className="font-black text-zinc-900 mt-1">{role.title}</div>
                          <div className="text-xs text-zinc-500 mt-1">{role.summary}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="h-12 px-4 rounded-xl border border-zinc-200" placeholder="Full name *" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
                  <input className="h-12 px-4 rounded-xl border border-zinc-200" placeholder="Email *" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
                  <input className="h-12 px-4 rounded-xl border border-zinc-200" placeholder="Phone *" value={form.phone} onChange={e => setField('phone', e.target.value)} />
                  <input className="h-12 px-4 rounded-xl border border-zinc-200" placeholder="City *" value={form.city} onChange={e => setField('city', e.target.value)} />
                  <input className="h-12 px-4 rounded-xl border border-zinc-200" placeholder="State *" value={form.state} onChange={e => setField('state', e.target.value)} />
                  <div className="h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center text-sm text-zinc-600 gap-2">
                    <FaRegClock className="text-zinc-400" /> Fast response process
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Professional profiles (optional)</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input className="h-11 px-4 rounded-xl border border-zinc-200" placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={e => setField('linkedinUrl', e.target.value)} />
                    <input className="h-11 px-4 rounded-xl border border-zinc-200" placeholder="Facebook URL" value={form.facebookUrl} onChange={e => setField('facebookUrl', e.target.value)} />
                    <input className="h-11 px-4 rounded-xl border border-zinc-200" placeholder="X (Twitter) URL" value={form.xUrl} onChange={e => setField('xUrl', e.target.value)} />
                  </div>
                </div>

                {selectedRole && (
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><FaUserTie className="text-zinc-400" /> Role questions</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roleQuestions.map(question => (
                        <div key={question.id} className={question.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="block text-xs font-bold text-zinc-600 mb-1.5">{question.label}{question.required ? ' *' : ''}</label>
                          {question.type === 'select' ? (
                            <select title={question.label} className="h-11 w-full px-3 rounded-xl border border-zinc-200" value={answers[question.id] || ''} onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}>
                              <option value="">Select...</option>
                              {(question.options || []).map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                          ) : question.type === 'yesno' ? (
                            <div className="flex gap-2">
                              {['Yes', 'No'].map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, [question.id]: option }))}
                                  className={`px-4 h-11 rounded-xl border font-bold text-sm ${
                                    answers[question.id] === option ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-700'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          ) : question.type === 'textarea' ? (
                            <textarea className="w-full min-h-24 px-3 py-2 rounded-xl border border-zinc-200" placeholder={question.placeholder} value={answers[question.id] || ''} onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} />
                          ) : (
                            <input className="h-11 w-full px-3 rounded-xl border border-zinc-200" type={question.type === 'number' ? 'number' : 'text'} placeholder={question.placeholder} value={answers[question.id] || ''} onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <textarea className="w-full min-h-24 px-4 py-3 rounded-xl border border-zinc-200" placeholder="Anything else we should know? (optional)" value={form.notes} onChange={e => setField('notes', e.target.value)} />

                <div className="space-y-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <label className="flex items-start gap-2 text-sm text-zinc-700">
                    <input type="checkbox" className="mt-1" checked={form.interviewReady} onChange={e => setField('interviewReady', e.target.checked)} />
                    I understand this is a fast hiring process and I should be ready to answer a call for interview/vetting.
                  </label>
                  <label className="flex items-start gap-2 text-sm text-zinc-700">
                    <input type="checkbox" className="mt-1" checked={form.independentContractorAck} onChange={e => setField('independentContractorAck', e.target.checked)} />
                    I understand MohnMenu is a platform connector and opportunities may be independent-contractor or business-direct positions.
                  </label>
                  {requiresBackgroundCheck && (
                    <label className="flex items-start gap-2 text-sm text-zinc-700">
                      <input type="checkbox" className="mt-1" checked={form.backgroundCheckConsent} onChange={e => setField('backgroundCheckConsent', e.target.checked)} />
                      I consent to background-check processing where required for this role.
                    </label>
                  )}
                </div>

                {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-bold px-4 py-3">{error}</div>}

                <div className="flex flex-wrap items-center gap-3 justify-end">
                  <button onClick={resetAndClose} type="button" className="px-6 py-3 rounded-full border border-zinc-200 font-bold text-zinc-700 hover:border-zinc-400">Cancel</button>
                  <button onClick={onSubmit} disabled={submitting} type="button" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-black text-white font-bold hover:bg-zinc-800 disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit Application'} <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
