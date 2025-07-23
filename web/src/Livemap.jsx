import { useEffect, useState } from "react"
import { db } from "./firebase"
import { collection, onSnapshot } from "firebase/firestore"
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Card, CardHeader, CardContent, CardTitle, Badge, Input, Separator, ScrollArea } from "./components/UIComponents"
import { AlertTriangle, Phone, Mail, MapPin, Search, Clock, Users, Zap } from "lucide-react"

const alertIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="m12 17 .01 0"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "animate-pulse drop-shadow-lg",
})


const LiveMap = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  // Estado para mostrar/ocultar sidebar en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const usersRef = collection(db, "users")
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const activeUsers = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (
          data.alertaActiva === true &&
          data.location &&
          data.location.latitude != null &&
          data.location.longitude != null
        ) {
          activeUsers.push({
            id: doc.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            location: data.location,
            timestamp: data.timestamp,
          })
        }
      })
      setUsers(activeUsers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const center = users.length ? [users[0].location.latitude, users[0].location.longitude] : [21.1619, -86.8515]

  const formatTime = (timestamp) => {
    if (!timestamp) return "Hace un momento"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)

    if (diff < 1) return "Ahora mismo"
    if (diff < 60) return `Hace ${diff} min`
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 relative md:flex-row md:flex">
      {/* Navbar SIEMPRE arriba en móvil, fuera del sidebar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200 z-30 w-full fixed top-0 left-0">
        <span className="font-bold text-lg text-black">SafeWoman</span>
        <button
          className="p-2 rounded-md border border-slate-200 bg-slate-50 shadow-sm focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          {/* Icono hamburguesa */}
          <svg className="h-6 w-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar: drawer en móvil, fijo en desktop */}
      <aside
        className={`
          bg-white/95 backdrop-blur-sm shadow-2xl border-slate-200
          w-80 md:w-92
          fixed md:static top-0 left-0 h-full z-40
          transition-transform duration-300
          md:translate-x-0 md:border-r
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:top-0 md:left-0 md:shadow-2xl md:block
        `}
        style={{
          maxWidth: '92vw',
          marginTop: undefined,
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Centro de Alertas</h1>
                <p className="text-sm text-slate-600">Monitoreo en tiempo real</p>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              ACTIVO
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-600" />
                  <div className="mt-3">
                    <p className="text-xs text-red-600 font-medium">Alertas Activas</p>
                    <p className="text-lg font-bold text-red-700">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div className="mt-3">
                    <p className="text-xs text-orange-600 font-medium">Estado</p>
                    <p className="text-sm font-bold text-orange-700">{loading ? "Cargando..." : "En línea"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-red-400 focus:ring-red-400"
            />
          </div>
        </div>

        {/* Alerts List */}
        <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
          <div className="p-4 pb-18 md:pb-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center mt-6">
                  <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Sin alertas activas</h3>
                  <p className="text-sm text-slate-600">
                    {searchTerm
                      ? "No se encontraron resultados para tu búsqueda."
                      : "No hay personas con alertas activas en este momento."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-base text-red-600">Personas que necesitan ayuda actualmente</p>
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 group"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900">{user.name}</CardTitle>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(user.timestamp)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          URGENTE
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <a
                            href={`tel:${user.phone}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {user.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <a
                            href={`mailto:${user.email}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            {user.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-xs">
                            {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

      </aside>

      {/* Overlay oscuro cuando sidebar está abierto en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Enhanced Map */}
      <main
        className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? 'pointer-events-none blur-sm md:blur-0 md:pointer-events-auto' : ''}`}
        style={{
          minHeight: '300px',
          marginTop: '56px', // para que el navbar no tape el mapa en móvil
          ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { marginTop: 0 } : {}),
        }}
      >
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full z-0 md:rounded-l-xl shadow-inner"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: '300px' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {users.map((user) => (
            <Marker key={user.id} position={[user.location.latitude, user.location.longitude]} icon={alertIcon}>
              <Popup className="max-w-sm" closeButton={false}>
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-red-700">{user.name}</CardTitle>
                    </div>
                    <Badge variant="destructive" className="w-fit mt-1">
                      ALERTA ACTIVA
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline font-medium">
                          {user.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline text-sm">
                          {user.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-slate-500" />
                        {formatTime(user.timestamp)}
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-sm text-red-600 font-bold">
                      ¡Necesita ayuda inmediata!
                    </p>
                  </CardContent>
                </Card>
              </Popup>
              <Tooltip
                direction="top"
                offset={[0, -10]}
                className="bg-slate-900 text-white px-2 py-1 rounded shadow-lg"
              >
                <span className="font-bold justify-center items-center">{user.name} <p className="font-extrabold text-red-600">¡Necesita ayuda inmediata!</p></span>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Loading Overlay */}
        {loading && (
          <Card className="absolute top-6 left-6 z-10 shadow-xl border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-semibold text-blue-700">Conectando...</p>
                  <p className="text-sm text-blue-600">Sincronizando datos en tiempo real</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default LiveMap;