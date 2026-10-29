import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ClipboardCheck,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  createChecklist,
  createChecklistItem,
} from '../../services/checklists';

interface ChecklistItemDraft {
  id: number;
  question: string;
  is_required: boolean;
}

export default function ChecklistForm() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [items, setItems] = useState<ChecklistItemDraft[]>([
    {
      id: 1,
      question: '',
      is_required: true,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id:
          current.length > 0
            ? Math.max(...current.map((item) => item.id)) + 1
            : 1,
        question: '',
        is_required: true,
      },
    ]);
  };

  const updateItem = (
    id: number,
    field: keyof ChecklistItemDraft,
    value: string | boolean,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Checklist name is required.');
      return;
    }

    const validItems = items.filter(
      (item) => item.question.trim() !== '',
    );

    if (validItems.length === 0) {
      setError(
        'Add at least one checklist item before creating the checklist.',
      );
      return;
    }

    if (validItems.length !== items.length) {
      setError(
        'Please fill in every checklist item or remove the empty item.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const checklistResponse = await createChecklist({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      const checklistId = checklistResponse.data.id;

      for (const [index, item] of validItems.entries()) {
        await createChecklistItem(checklistId, {
          question: item.question.trim(),
          sort_order: index + 1,
          is_required: item.is_required,
        });
      }

      navigate('/checklists');
    } catch (err: any) {
      const validationErrors =
        err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors,
        )[0] as string[] | undefined;

        setError(
          firstError?.[0] ||
            'Please check the submitted data.',
        );
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to create safety checklist.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-slate-100 lg:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back */}
        <Link
          to="/checklists"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Checklists
        </Link>

        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-blue-400">
                K3 Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                New Safety Checklist
              </h1>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Create a reusable checklist for safety inspections.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
        >
          <div className="space-y-8 p-6 lg:p-8">
            {/* Basic information */}
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Checklist Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Example: Production Safety Inspection"
                  maxLength={255}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the purpose of this checklist."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Checklist Items
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the questions that should be evaluated
                    during inspection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-semibold text-blue-400">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`question-${item.id}`}
                          className="mb-2 block text-sm font-medium text-slate-300"
                        >
                          Question
                        </label>

                        <input
                          id={`question-${item.id}`}
                          type="text"
                          value={item.question}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              'question',
                              event.target.value,
                            )
                          }
                          placeholder="Example: APAR tersedia dan mudah diakses?"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                        />

                        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-slate-400">
                          <input
                            type="checkbox"
                            checked={item.is_required}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                'is_required',
                                event.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                          />

                          <span>
                            Required item
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        disabled={items.length === 1}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Remove item ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="text-sm font-medium text-blue-300">
                    Checklist workflow
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    This checklist will become a reusable template.
                    When an inspection is created, its items will
                    be copied into the inspection as a snapshot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end lg:px-8">
            <Link
              to="/checklists"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Checklist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}