import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestModal } from "@/components/RequestModal";
import { MapView } from "@/components/MapView";
import { dorms, Dorm } from "@/data/dorms";
import { track } from "@/lib/tracking";
import { toast } from "sonner";

export default function DormDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dorm, setDorm] = useState<Dorm | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = dorms.find(d => d.id === slug);
    if (found) {
      setDorm(found);
      track("view_dorm", { dormId: found.id, dormName: found.name });
    } else {
      navigate("/dorms");
    }
  }, [slug, navigate]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetDirections = () => {
    if (dorm) {
      const url = `https://www.google.com/maps?q=${dorm.lat},${dorm.lng}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (!dorm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Link to="/dorms">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to results
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="space-y-4 mb-6">
              {dorm.photos.map((photo, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center text-muted-foreground">
                    <div className="text-5xl mb-2">🏠</div>
                    <div className="text-sm">{photo}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Location</h3>
              <MapView
                dorms={[dorm]}
                center={[dorm.lat, dorm.lng]}
                height="300px"
                zoom={14}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetDirections}
                className="mt-2 w-full"
              >
                <ExternalLink size={14} className="mr-2" />
                Get directions
              </Button>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{dorm.name}</h1>
                <p className="text-lg text-muted-foreground">{dorm.university}</p>
              </div>
              {dorm.verified && (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 size={14} className="mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin size={16} className="mr-1" />
              {dorm.address} • {dorm.distanceKm} km from center
            </div>

            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold text-primary mb-1">
                {dorm.priceKzt.toLocaleString()} ₸
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-semibold mb-3">Room Types</h3>
                <div className="flex flex-wrap gap-2">
                  {dorm.roomTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Gender Policy</h3>
                <Badge variant="outline" className="capitalize">
                  {dorm.genderPolicy}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {dorm.amenities.map(amenity => (
                    <li key={amenity} className="flex items-center text-sm">
                      <CheckCircle2 size={16} className="mr-2 text-success flex-shrink-0" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setRequestModalOpen(true)}
                className="flex-1"
                size="lg"
              >
                Request
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="mr-2" size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2" size={16} />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RequestModal
        dorm={dorm}
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </>
  );
}
