import assert from 'assert';
import { useContext } from 'react';
import { PlayerName } from '../CoveyTypes';
import PlayerNameContext from '../contexts/PlayerNameContext';

/**
 * Use this hook to access the current user name.
 */
export default function usePlayerName(): PlayerName {
  const ctx = useContext(PlayerNameContext);
  assert(ctx, 'User profile should be defined.');
  return ctx;
}
