var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"routes","filename":"client/src/app/app.routing.ts","module":"AppRoutingModule","children":[{"path":"table/:id","component":"TableComponent","data":{"roles":["user","admin"]},"canActivate":["AuthGuard"]},{"path":"register","component":"RegisterComponent"},{"path":"login","component":"LoginComponent"},{"path":"","component":"LayoutComponent","children":[{"path":"","redirectTo":"/dashboard","pathMatch":"full"},{"path":"dashboard","component":"DashboardComponent"},{"path":"profile","component":"ProfileComponent"},{"path":"chat","component":"ChatComponent"}],"data":{"roles":["user","admin"]},"canActivate":["AuthGuard"]}],"kind":"module"}]}
