import { AppProviders } from './routes/AppProviders';
import Router from './routes';

function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}

export default App;