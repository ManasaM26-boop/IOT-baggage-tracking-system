import heapq


AIRPORT_GRAPH = {
    "Check-in": {
        "Security": 5,
        "Baggage Screening": 3
    },

    "Security": {
        "Check-in": 5,
        "Loading Area": 4
    },

    "Baggage Screening": {
        "Check-in": 3,
        "Loading Area": 6
    },

    "Loading Area": {
        "Security": 4,
        "Baggage Screening": 6,
        "Aircraft": 2
    },

    "Aircraft": {
        "Loading Area": 2
    }
}


def dijkstra(graph, start, destination):

    distances = {
        location: float('inf')
        for location in graph
    }

    previous = {
        location: None
        for location in graph
    }

    distances[start] = 0

    priority_queue = [(0, start)]

    while priority_queue:

        current_distance, current_location = heapq.heappop(
            priority_queue
        )

        if current_location == destination:
            break

        if current_distance > distances[current_location]:
            continue

        for neighbor, weight in graph[current_location].items():

            distance = current_distance + weight

            if distance < distances[neighbor]:

                distances[neighbor] = distance

                previous[neighbor] = current_location

                heapq.heappush(
                    priority_queue,
                    (distance, neighbor)
                )

    if distances[destination] == float('inf'):
        return None, float('inf')

    path = []

    current = destination

    while current is not None:

        path.append(current)

        current = previous[current]

    path.reverse()

    return path, distances[destination]