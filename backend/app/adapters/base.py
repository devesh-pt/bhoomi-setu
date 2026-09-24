from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseLandAdapter(ABC):
    """
    Abstract Base Class for Land Record Adapters.
    Defines the standard interface for land search, B-1 Khatauni, P-II Khasra,
    Girdawari crop entries, Bhu-Naksha map layers, mutation applications,
    grievances, and revenue court cases.
    """

    @abstractmethod
    def search_cascading(
        self,
        district: Optional[str] = None,
        tehsil: Optional[str] = None,
        ri_circle: Optional[str] = None,
        village: Optional[str] = None,
        khasra_no: Optional[str] = None,
        owner_name: Optional[str] = None,
        khata_no: Optional[str] = None,
        query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Perform cascading land record search."""
        pass

    @abstractmethod
    def get_b1_khatauni(self, khata_no: str, district: Optional[str] = None) -> Dict[str, Any]:
        """Fetch B-1 Khatauni extract (Owner details, all plots held, total area, revenue)."""
        pass

    @abstractmethod
    def get_pii_khasra(self, parcel_id: str) -> Dict[str, Any]:
        """Fetch P-II Khasra plot details (Khasra no, land type, soil, crop, possession)."""
        pass

    @abstractmethod
    def get_girdawari(self, parcel_id: str) -> Dict[str, Any]:
        """Fetch season-wise crop and possession entries (Kharif, Rabi, Zaid)."""
        pass

    @abstractmethod
    def submit_mutation(self, mutation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit new mutation application (transfer, inheritance, partition)."""
        pass

    @abstractmethod
    def get_mutation_status(self, application_id: str) -> Dict[str, Any]:
        """Track 5-stage mutation status timeline."""
        pass

    @abstractmethod
    def submit_grievance(self, grievance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit record correction request or grievance ticket."""
        pass

    @abstractmethod
    def get_revenue_court_cases(self, parcel_id: Optional[str] = None, district: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch active revenue court cases linked to land parcels."""
        pass
