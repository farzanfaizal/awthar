"use client";

import { useState } from "react";
import { MapPin, X, Loader2, ChevronDown, DollarSign, Grid3X3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category } from "@/types";
import { getCategoryIcon, getCategoryColors } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface LocationFilterProps {
  locationName: string | null;
  radius: number;
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  onRequestLocation: () => void;
  onClearLocation: () => void;
  onRadiusChange: (value: number) => void;
}

export function LocationFilter({ locationName, radius, loading, error, hasLocation, onRequestLocation, onClearLocation, onRadiusChange }: LocationFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-10 justify-between border hover:border-primary/30 transition-colors", hasLocation && "border-primary/20 bg-primary/5")}>
          <div className="flex items-center gap-2">
            <MapPin className={cn("h-4 w-4", hasLocation ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm truncate max-w-[120px]">{locationName || "Location"}</span>
          </div>
          {hasLocation ? (
            <button onClick={(e) => { e.stopPropagation(); onClearLocation(); }} className="ml-2 hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm mb-3">Service Location</h4>
          {hasLocation ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Search radius</span>
                <span className="font-medium">{radius} km</span>
              </div>
              <Slider min={1} max={100} step={1} value={[radius]} onValueChange={(vals) => onRadiusChange(vals[0])} />
              <p className="text-xs text-muted-foreground">Services within {radius} km of your location</p>
            </div>
          ) : (
            <div>
              <Button variant="outline" className="w-full justify-start border-dashed" onClick={() => { onRequestLocation(); setOpen(false); }} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                Use my current location
              </Button>
              {error && <p className="text-xs text-destructive mt-2">{error}</p>}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (slug: string) => void;
}

export function CategoryFilter({ categories, selectedCategories, onToggleCategory }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedCount = selectedCategories.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-10 justify-between border hover:border-primary/30 transition-colors", selectedCount > 0 && "border-primary/20 bg-primary/5")}>
          <div className="flex items-center gap-2">
            <Grid3X3 className={cn("h-4 w-4", selectedCount > 0 ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm">{selectedCount > 0 ? `${selectedCount} Categories` : "Category"}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Service Categories</h4>
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.iconName);
                const colors = getCategoryColors(cat.slug);
                const isSelected = selectedCategories.includes(cat.slug);
                return (
                  <div key={cat.id} className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted", isSelected && "bg-primary/5")} onClick={() => onToggleCategory(cat.slug)}>
                    <Checkbox id={`cat-${cat.slug}`} checked={isSelected} onCheckedChange={() => onToggleCategory(cat.slug)} />
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colors.bg)}>
                      <Icon className={cn("h-4 w-4", colors.text)} />
                    </div>
                    <Label htmlFor={`cat-${cat.slug}`} className="text-sm cursor-pointer flex-1">{cat.nameEn}</Label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface PriceFilterProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}

export function PriceFilter({ priceRange, onPriceChange }: PriceFilterProps) {
  const [open, setOpen] = useState(false);
  const hasCustomRange = priceRange[0] > 0 || priceRange[1] < 2000;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-10 justify-between border hover:border-primary/30 transition-colors", hasCustomRange && "border-primary/20 bg-primary/5")}>
          <div className="flex items-center gap-2">
            <DollarSign className={cn("h-4 w-4", hasCustomRange ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm">{hasCustomRange ? `${priceRange[0]}-${priceRange[1]} AED` : "Price"}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Price Range (AED)</h4>
          <Slider min={0} max={2000} step={50} value={priceRange} onValueChange={(vals) => onPriceChange(vals as [number, number])} />
          <div className="flex items-center justify-between">
            <div className="bg-muted px-3 py-1.5 rounded-lg"><span className="text-sm font-medium">{priceRange[0]} AED</span></div>
            <span className="text-sm text-muted-foreground">to</span>
            <div className="bg-muted px-3 py-1.5 rounded-lg"><span className="text-sm font-medium">{priceRange[1]} AED</span></div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MoreFiltersProps {
  verifiedOnly: boolean;
  minRating: number | undefined;
  onVerifiedChange: (value: boolean) => void;
  onMinRatingChange: (value: number | undefined) => void;
  activeCount: number;
}

export function MoreFiltersButton({ verifiedOnly, minRating, onVerifiedChange, onMinRatingChange, activeCount }: MoreFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-10 justify-between border hover:border-primary/30 transition-colors relative", activeCount > 0 && "border-primary/20 bg-primary/5")}>
          <div className="flex items-center gap-2">
            <Filter className={cn("h-4 w-4", activeCount > 0 ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm">More Filters</span>
          </div>
          {activeCount > 0 && (
            <Badge variant="default" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">{activeCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Additional Filters</h4>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="verified" className="text-sm cursor-pointer">Verified providers only</Label>
              <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(checked) => onVerifiedChange(!!checked)} />
            </div>
            <Separator />
            <div>
              <Label className="text-sm mb-2 block">Minimum Rating</Label>
              <div className="space-y-2">
                <button onClick={() => onMinRatingChange(undefined)} className={cn("w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors", !minRating && "border-primary bg-primary/5")}>Any rating</button>
                {[4, 4.5].map((rating) => (
                  <button key={rating} onClick={() => onMinRatingChange(rating)} className={cn("w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors", minRating === rating && "border-primary bg-primary/5")}>{rating}+ stars</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
