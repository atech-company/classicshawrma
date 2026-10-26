"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type VariantDraft = {
  name_en: string;
  name_ar: string;
  price_adjustment: number;
  is_active: boolean;
};

export type ModifierOptionDraft = {
  name_en: string;
  name_ar: string;
  price_adjustment: number;
  is_active: boolean;
};

export type ModifierGroupDraft = {
  name_en: string;
  name_ar: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: ModifierOptionDraft[];
};

export function ItemCustomizationsEditor({
  variants,
  groups,
  onVariantsChange,
  onGroupsChange,
}: {
  variants: VariantDraft[];
  groups: ModifierGroupDraft[];
  onVariantsChange: (next: VariantDraft[]) => void;
  onGroupsChange: (next: ModifierGroupDraft[]) => void;
}) {
  return (
    <div className="space-y-6 md:col-span-2">
      <section className="rounded-xl border border-[#e4ddd3] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Variants (size / option)</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onVariantsChange([
                ...variants,
                {
                  name_en: "",
                  name_ar: "",
                  price_adjustment: 0,
                  is_active: true,
                },
              ])
            }
          >
            Add variant
          </Button>
        </div>
        <div className="mt-3 space-y-3">
          {variants.length === 0 && (
            <p className="text-sm text-[#6b645c]">
              Optional. Example: Small / Large with price adjustments.
            </p>
          )}
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg bg-[#f6f3ee] p-3 md:grid-cols-4"
            >
              <Input
                placeholder="Name EN"
                value={variant.name_en}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...variant, name_en: e.target.value };
                  onVariantsChange(next);
                }}
              />
              <Input
                placeholder="Name AR"
                dir="rtl"
                value={variant.name_ar}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = { ...variant, name_ar: e.target.value };
                  onVariantsChange(next);
                }}
              />
              <Input
                type="number"
                placeholder="Price adj."
                value={variant.price_adjustment}
                onChange={(e) => {
                  const next = [...variants];
                  next[index] = {
                    ...variant,
                    price_adjustment: Number(e.target.value) || 0,
                  };
                  onVariantsChange(next);
                }}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={variant.is_active}
                    onChange={(e) => {
                      const next = [...variants];
                      next[index] = { ...variant, is_active: e.target.checked };
                      onVariantsChange(next);
                    }}
                  />
                  Active
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onVariantsChange(variants.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e4ddd3] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Extras / modifier groups</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onGroupsChange([
                ...groups,
                {
                  name_en: "",
                  name_ar: "",
                  is_required: false,
                  min_selections: 0,
                  max_selections: 1,
                  options: [
                    {
                      name_en: "",
                      name_ar: "",
                      price_adjustment: 0,
                      is_active: true,
                    },
                  ],
                },
              ])
            }
          >
            Add group
          </Button>
        </div>
        <div className="mt-3 space-y-4">
          {groups.length === 0 && (
            <p className="text-sm text-[#6b645c]">
              Optional. Example: Sauces, Extra cheese (required or multi-select).
            </p>
          )}
          {groups.map((group, gIndex) => (
            <div key={gIndex} className="rounded-lg border border-[#e4ddd3] p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="Group name EN"
                  value={group.name_en}
                  onChange={(e) => {
                    const next = [...groups];
                    next[gIndex] = { ...group, name_en: e.target.value };
                    onGroupsChange(next);
                  }}
                />
                <Input
                  placeholder="Group name AR"
                  dir="rtl"
                  value={group.name_ar}
                  onChange={(e) => {
                    const next = [...groups];
                    next[gIndex] = { ...group, name_ar: e.target.value };
                    onGroupsChange(next);
                  }}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={group.is_required}
                    onChange={(e) => {
                      const next = [...groups];
                      next[gIndex] = { ...group, is_required: e.target.checked };
                      onGroupsChange(next);
                    }}
                  />
                  Required
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={group.min_selections}
                    onChange={(e) => {
                      const next = [...groups];
                      next[gIndex] = {
                        ...group,
                        min_selections: Number(e.target.value) || 0,
                      };
                      onGroupsChange(next);
                    }}
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Max"
                    value={group.max_selections}
                    onChange={(e) => {
                      const next = [...groups];
                      next[gIndex] = {
                        ...group,
                        max_selections: Number(e.target.value) || 1,
                      };
                      onGroupsChange(next);
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {group.options.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    className="grid gap-2 rounded-md bg-[#f6f3ee] p-2 md:grid-cols-4"
                  >
                    <Input
                      placeholder="Option EN"
                      value={opt.name_en}
                      onChange={(e) => {
                        const next = [...groups];
                        const options = [...group.options];
                        options[oIndex] = { ...opt, name_en: e.target.value };
                        next[gIndex] = { ...group, options };
                        onGroupsChange(next);
                      }}
                    />
                    <Input
                      placeholder="Option AR"
                      dir="rtl"
                      value={opt.name_ar}
                      onChange={(e) => {
                        const next = [...groups];
                        const options = [...group.options];
                        options[oIndex] = { ...opt, name_ar: e.target.value };
                        next[gIndex] = { ...group, options };
                        onGroupsChange(next);
                      }}
                    />
                    <Input
                      type="number"
                      value={opt.price_adjustment}
                      onChange={(e) => {
                        const next = [...groups];
                        const options = [...group.options];
                        options[oIndex] = {
                          ...opt,
                          price_adjustment: Number(e.target.value) || 0,
                        };
                        next[gIndex] = { ...group, options };
                        onGroupsChange(next);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const next = [...groups];
                        next[gIndex] = {
                          ...group,
                          options: group.options.filter((_, i) => i !== oIndex),
                        };
                        onGroupsChange(next);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const next = [...groups];
                      next[gIndex] = {
                        ...group,
                        options: [
                          ...group.options,
                          {
                            name_en: "",
                            name_ar: "",
                            price_adjustment: 0,
                            is_active: true,
                          },
                        ],
                      };
                      onGroupsChange(next);
                    }}
                  >
                    Add option
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      onGroupsChange(groups.filter((_, i) => i !== gIndex))
                    }
                  >
                    Remove group
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
