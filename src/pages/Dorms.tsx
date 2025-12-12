import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DormCard } from "@/components/DormCard";
import { RequestModal } from "@/components/RequestModal";
import { MapWrapper } from "@/components/MapWrapper";
import { dorms as localDorms, Dorm } from "@/data/dorms";
import { getDorms } from "@/lib/api";
import { track } from "@/lib/tracking";
import { SlidersHorizontal, List, Map as MapIcon } from "lucide-react";

export default function Dorms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [highlightedDormId, setHighlightedDormId] = useState<string | undefined>();
  
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";

  // Filter states
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [genderPolicy, setGenderPolicy] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("price-asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const [dorms, setDorms] = useState<Dorm[]>(localDorms);
  
  // Загружаем данные с сервера при монтировании
  useEffect(() => {
    getDorms()
      .then((serverDorms: Dorm[]) => {
        if (serverDorms && serverDorms.length > 0) {
          setDorms(serverDorms);
        }
      })
      .catch(() => {
        // Используем локальные данные если сервер недоступен
        console.warn('Server unavailable, using local dorms data');
      });
  }, []);

  const universities = Array.from(new Set(dorms.map(d => d.university)));

  // Apply filters from URL params (from onboarding)
  useEffect(() => {
    const university = searchParams.get("university");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const gender = searchParams.get("gender");
    const room = searchParams.get("roomType");

    if (university && universities.includes(university)) {
      setSelectedUniversities([university]);
    }
    if (priceMin && priceMax) {
      setPriceRange([parseInt(priceMin), parseInt(priceMax)]);
    }
    if (gender && gender !== "any") {
      setGenderPolicy(gender);
    }
  }, []);

  useEffect(() => {
    track("view_search", {});
  }, []);

  useEffect(() => {
    if (viewMode === "map") {
      track("open_map", {});
    }
  }, [viewMode]);

  const handleViewModeChange = (mode: string) => {
    const params = new URLSearchParams(searchParams);
    if (mode === "map") {
      params.set("view", "map");
      track("toggle_map_list", { mode: "map" });
    } else {
      params.delete("view");
      track("toggle_map_list", { mode: "list" });
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

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

  const handleDormCardClick = (dorm: Dorm) => {
    setHighlightedDormId(dorm.id);
    if (viewMode === "map") {
      setSelectedDorm(dorm);
    }
  };

  const handleMapViewDetails = (dorm: Dorm) => {
    navigate(`/dorms/${dorm.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Поиск общежитий</h1>
          <p className="text-muted-foreground">
            Найдено {filteredAndSortedDorms.length} общежити{filteredAndSortedDorms.length === 1 ? "е" : filteredAndSortedDorms.length < 5 ? "я" : "й"}
          </p>
        </div>
        
        <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-fit">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Список
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapIcon className="h-4 w-4" />
              Карта
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Panel */}
        <aside className={`lg:w-80 ${filtersVisible ? "block" : "hidden lg:block"}`}>
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Фильтры
              </h2>
              <Button variant="ghost" size="sm" onClick={handleReset} className="min-h-[36px]">
                Сбросить
              </Button>
            </div>

            <div className="space-y-6">
              {/* Universities */}
              <div>
                <Label className="mb-3 block">Университет</Label>
                <div className="space-y-2">
                  {universities.map(uni => (
                    <div key={uni} className="flex items-center space-x-2 group">
                      <Checkbox
                        id={uni}
                        checked={selectedUniversities.includes(uni)}
                        onCheckedChange={() => handleUniversityToggle(uni)}
                        className="cursor-pointer"
                      />
                      <label 
                        htmlFor={uni} 
                        className="text-sm cursor-pointer flex-1 py-2 px-2 -ml-2 rounded hover:bg-accent transition-colors"
                        style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                      >
                        {uni}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-3 block">
                  Цена: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ₸
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
                <Label className="mb-3 block">Гендерная политика</Label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Все" },
                    { value: "male", label: "Мужские" },
                    { value: "female", label: "Женские" },
                    { value: "mixed", label: "Смешанные" }
                  ].map(policy => (
                    <div key={policy.value} className="flex items-center space-x-2 group">
                      <input
                        type="radio"
                        id={policy.value}
                        name="gender"
                        checked={genderPolicy === policy.value}
                        onChange={() => setGenderPolicy(policy.value)}
                        className="cursor-pointer"
                      />
                      <label 
                        htmlFor={policy.value} 
                        className="text-sm cursor-pointer flex-1 py-2 px-2 -ml-2 rounded hover:bg-accent transition-colors"
                        style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                      >
                        {policy.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <Label className="mb-3 block">
                  Макс. расстояние: {maxDistance} км
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
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="verified"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                  className="cursor-pointer"
                />
                <label 
                  htmlFor="verified" 
                  className="text-sm cursor-pointer flex-1 py-2 px-2 -ml-2 rounded hover:bg-accent transition-colors"
                  style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                >
                  Только проверенные
                </label>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort" className="mb-3 block">Сортировка</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                    <SelectItem value="distance-asc">Расстояние: ближайшие</SelectItem>
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
              className="w-full min-h-[44px]"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              {filtersVisible ? "Скрыть" : "Показать"} фильтры
            </Button>
          </div>

          {viewMode === "list" ? (
            paginatedDorms.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  Нет общежитий, соответствующих вашим фильтрам.
                </p>
                <p className="text-muted-foreground mb-6">
                  Попробуйте расширить диапазон цены или расстояния.
                </p>
                <Button onClick={handleReset}>Сбросить фильтры</Button>
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
                  <div className="flex justify-center gap-2 items-center flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      Назад
                    </Button>
                    <div className="flex items-center px-4 py-2">
                      Страница {currentPage} из {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      Вперед
                    </Button>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="h-[600px]">
              <MapWrapper
                dorms={filteredAndSortedDorms}
                onDormClick={(dorm) => setHighlightedDormId(dorm.id)}
                onViewDetails={handleMapViewDetails}
                onRequestClick={handleRequestClick}
                highlightedDormId={highlightedDormId}
                className="h-full"
              />
              {filteredAndSortedDorms.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Нет общежитий, соответствующих вашим фильтрам.
                  </p>
                  <Button onClick={handleReset} variant="outline" className="mt-4">
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
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
