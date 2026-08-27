const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function getBaggage() {
  const response = await fetch(`${API_BASE_URL}/baggage/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch baggage: ${response.status}`);
  }

  return response.json();
}

export async function getBaggageDashboard(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/dashboard/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.status}`);
  }

  return response.json();
}

export async function getBaggageLocationHistory(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/location/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch location history: ${response.status}`);
  }

  return response.json();
}

export async function getOptimalRoute(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/optimal_route/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch optimal route: ${response.status}`);
  }

  return response.json();
}

export async function getRouteComparison(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/compare_route/`
  );

  if (!response.ok) {
    throw new Error(`Failed to compare route: ${response.status}`);
  }

  return response.json();
}

export async function getDelayCheck(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/delay_check/`
  );

  if (!response.ok) {
    throw new Error(`Failed to check delay: ${response.status}`);
  }

  return response.json();
}

export async function getBaggageProgress(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/progress/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch progress: ${response.status}`);
  }

  return response.json();
}

export async function getBaggageRisk(baggageId) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/risk/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch risk: ${response.status}`);
  }

  return response.json();
}

export async function updateBaggageStatus(baggageId, status) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/update_status/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.status}`);
  }

  return response.json();
}

export async function addBaggageLocation(
  baggageId,
  location,
  status
) {
  const response = await fetch(
    `${API_BASE_URL}/baggage/${baggageId}/location/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location,
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add location: ${response.status}`);
  }

  return response.json();
}