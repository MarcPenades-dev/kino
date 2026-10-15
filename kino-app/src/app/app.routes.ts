import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash', // ← cambiado de 'login' a 'splash'
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash.page')
        .then(m => m.SplashPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },

  // RUTAS DEL ACTOR
  {
    path: 'tabs-actor',
    loadComponent: () => import('./pages/tabs-actor/tabs-actor.page').then(m => m.TabsActorPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/actor-home/actor-home.page').then(m => m.ActorHomePage)
      },
      {
        path: 'applications',
        loadComponent: () => import('./pages/actor-applications/actor-applications.page').then(m => m.ActorApplicationsPage)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/calendario-actor/calendario-actor.page').then(m => m.CalendarioActorPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/actor-profile/actor-profile.page').then(m => m.ActorProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // RUTAS DEL DIRECTOR
  {
    path: 'tabs-director',
    loadComponent: () => import('./pages/tabs-director/tabs-director.page').then(m => m.TabsDirectorPage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio-director/inicio-director.page').then(m => m.InicioDirectorPage)
      },
      {
        path: 'matches',
        loadComponent: () => import('./pages/matches-director/matches-director.page').then(m => m.MatchesDirectorPage)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./pages/calendario-director/calendario-director.page').then(m => m.CalendarioDirectorPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },

  // OTRAS RUTAS
  {
    path: 'actor-onboarding',
    children: [
      {
        path: 'step1',
        loadComponent: () => import('./pages/actor-onboarding/step1/step1.page').then(m => m.Step1Page)
      },
      {
        path: 'step2',
        loadComponent: () => import('./pages/actor-onboarding/step2/step2.page').then(m => m.Step2Page)
      }
    ]
  },
  {
    path: 'buscar',
    loadComponent: () => import('./pages/buscar/buscar.page').then(m => m.BuscarPage)
  },
  {
    path: 'script-detail/:id',
    loadComponent: () => import('./pages/script-detail/script-detail.page').then(m => m.ScriptDetailPage)
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },
  {
    path: 'actores-seleccionados/:scriptId',
    loadComponent: () => import('./pages/actores-seleccionados/actores-seleccionados.page').then(m => m.ActoresSeleccionadosPage)
  },
  {
    path: 'actor-applications',
    loadComponent: () => import('./pages/actor-applications/actor-applications.page').then(m => m.ActorApplicationsPage)
  },
  {
    path: 'actor-profile',
    loadComponent: () => import('./pages/actor-profile/actor-profile.page').then(m => m.ActorProfilePage)
  },
  {
    path: 'actor-edit-profile',
    loadComponent: () => import('./pages/actor-edit-profile/actor-edit-profile.page').then(m => m.ActorEditProfilePage)
  },
  {
    path: 'application-detail/:id',
    loadComponent: () => import('./pages/application-detail/application-detail.page')
      .then(m => m.ApplicationDetailPage)
  },
  {
    path: 'chat/:matchId',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'user-profile/:id',
    loadComponent: () => import('./pages/user-profile/user-profile.page').then(m => m.UserProfilePage)
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile.page').then(m => m.UserProfilePage)
  },

  // Pantalla Chats

  {
    path: 'mis-chats',
    loadComponent: () =>
      import('./pages/mis-chats/mis-chats.page')
        .then(m => m.MisChatsPage)
  },
  {
    path: 'mis-chats',
    loadComponent: () => import('./pages/mis-chats/mis-chats.page').then( m => m.MisChatsPage)
  },
];
