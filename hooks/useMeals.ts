'use client';


 

import { useEffect, useState } from 'react';

import type { Meal } from '@/types';


 

export function useMeals(date: string) {

  const [meals,   setMeals]   = useState<Meal[]>([]);

  const [loading, setLoading] = useState(true);

  const [error,   setError]   = useState<string | null>(null);


 

  useEffect(() => {

    if (!date) return;

    setLoading(true);

    setError(null);

    fetch(`/api/meals?date=${date}`)

      .then((r) => r.json())

      .then(({ meals, error }) => {

        if (error) setError(error);

        else setMeals(meals ?? []);

      })

      .catch(() => setError('Failed to load meals'))

      .finally(() => setLoading(false));

  }, [date]);


 

  return { meals, loading, error };

}