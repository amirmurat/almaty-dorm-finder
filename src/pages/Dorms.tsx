import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DormCard } from "@/components/DormCard";
import { RequestModal } from "@/components/RequestModal";
import { dorms, Dorm } from "@/data/dorms";
import { track } from "@/lib/tracking";
import { SlidersHorizontal } from "lucide-react";

export default function Dorms() {
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);

  // Filter states
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [genderPolicy, setGenderPolicy] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("price-asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const universities = Array.from(new Set(dorms.map(d => d.university)));

  useEffect(() => {
    track("view_search", {});
  }, []);

  useEffect(() => {
    track("apply_filters", {
      universities: selectedUniversities,
      priceRange,
      genderPolicy,
      maxDistance,
      verifiedOnly,
      sortBy
    });
  }, [selectedUniversities, priceRange, genderPolicy, maxDistance, verifiedOnly, sortBy]);

  const filteredAndSortedDorms = useMemo(() => {
    let result = dorms.filter(dorm => {
      if (selectedUniversities.length > 0 && !selectedUniversities.includes(dorm.university)) {
        return false;
      }
      if (dorm.priceKzt < priceRange[0] || dorm.priceKzt > priceRange[1]) {
        return false;
      }
      if (genderPolicy !== "all" && dorm.genderPolicy !== genderPolicy) {
        return false;
      }
      if (dorm.distanceKm > maxDistance) {
        return false;
      }
      if (verifiedOnly && !dorm.verified) {
        return false;
      }
      return true;
    });

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.priceKzt - b.priceKzt);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.priceKzt - a.priceKzt);
    } else if (sortBy === "distance-asc") {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return result;
  }, [selectedUniversities, priceRange, genderPolicy, maxDistance, verifiedOnly, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedDorms.length / itemsPerPage);
  const paginatedDorms = filteredAndSortedDorms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUniversityToggle = (uni: string) => {
    setSelectedUniversities(prev =>
      prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]
    );
  };

  const handleReset = () => {
    setSelectedUniversities([]);
    setPriceRange([0, 100000]);
    setGenderPolicy("all");
    setMaxDistance(10);
    setVerifiedOnly(false);
    setSortBy("price-asc");
    setCurrentPage(1);
  };

  const handleRequestClick = (dorm: Dorm) => {
    setSelectedDorm(dorm);
    setRequestModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Dorms</h1>
        <p className="text-muted-foreground">
          Found {filteredAndSortedDorms.length} dorm{filteredAndSortedDorms.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Panel */}
        <aside className={`lg:w-80 ${filtersVisible ? "block" : "hidden lg:block"}`}>
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Filters
              </h2>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <div className="space-y-6">
              {/* Universities */}
              <div>
                <Label className="mb-3 block">University</Label>
                <div className="space-y-2">
                  {universities.map(uni => (
                    <div key={uni} className="flex items-center space-x-2">
                      <Checkbox
                        id={uni}
                        checked={selectedUniversities.includes(uni)}
                        onCheckedChange={() => handleUniversityToggle(uni)}
                      />
                      <label htmlFor={uni} className="text-sm cursor-pointer">
                        {uni}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-3 block">
                  Price Range: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ₸
                </Label>
                <Slider
                  min={0}
                  max={100000}
                  step={5000}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-2"
                />
              </div>

              {/* Gender Policy */}
              <div>
                <Label className="mb-3 block">Gender Policy</Label>
                <div className="space-y-2">
                  {["all", "male", "female", "mixed"].map(policy => (
                    <div key={policy} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={policy}
                        name="gender"
                        checked={genderPolicy === policy}
                        onChange={() => setGenderPolicy(policy)}
                        className="cursor-pointer"
                      />
                      <label htmlFor={policy} className="text-sm cursor-pointer capitalize">
                        {policy === "all" ? "All" : policy}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <Label className="mb-3 block">
                  Max Distance: {maxDistance} km
                </Label>
                <Slider
                  min={1}
                  max={10}
                  step={0.5}
                  value={[maxDistance]}
                  onValueChange={(value) => setMaxDistance(value[0])}
                />
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                />
                <label htmlFor="verified" className="text-sm cursor-pointer">
                  Verified only
                </label>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort" className="mb-3 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="distance-asc">Distance: Near to Far</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="w-full"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              {filtersVisible ? "Hide" : "Show"} Filters
            </Button>
          </div>

          {paginatedDorms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                No dorms match your filters.
              </p>
              <p className="text-muted-foreground mb-6">
                Try widening the price or distance.
              </p>
              <Button onClick={handleReset}>Reset Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedDorms.map(dorm => (
                  <DormCard
                    key={dorm.id}
                    dorm={dorm}
                    onRequestClick={handleRequestClick}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <RequestModal
        dorm={selectedDorm}
        open={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setSelectedDorm(null);
        }}
      />
    </div>
  );
}
