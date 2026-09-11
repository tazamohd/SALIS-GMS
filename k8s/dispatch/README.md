# Dispatch — Kubernetes manifests

Not wired to a live cluster yet — prepared ahead of need, per ADR-001
(`docs/02-technical/adr/ADR-001-dispatch-service-extraction.md`). Today the
service runs via `docker-compose.yml` (`dispatch` + `dispatch-db`). These
manifests are what "move dispatch to K8s" looks like when that day comes.

## Apply order

```bash
kubectl apply -f namespace.yaml
kubectl apply -f rbac.yaml
kubectl apply -f configmap.yaml
# Real secret — do NOT apply secret.example.yaml as-is. Either edit a local
# untracked copy or create it directly:
kubectl create secret generic dispatch-secrets \
  --namespace salis-dispatch \
  --from-literal=DISPATCH_DATABASE_URL='postgresql://user:pass@host:5432/salis_dispatch'
kubectl apply -f deployment.yaml   # set image: to a real, pinned tag first
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f networkpolicy.yaml
```

## Validate

```bash
kubectl rollout status deployment/dispatch -n salis-dispatch
kubectl get pods -n salis-dispatch -w
kubectl logs -l app=dispatch -n salis-dispatch
```

## What's intentionally not here

- No service mesh (Istio/Linkerd) — single cluster, no mTLS requirement yet.
- No Ingress — Dispatch is called service-to-service, not from outside the
  cluster; add one only if an external caller needs direct access.
- No multi-cluster/DR config — revisit once this is the only place dispatch
  logic lives (currently the monolith still has a local fallback, see ADR-001).
