const express = require('express');
const router = express.Router();
const Hike = require('../Model/hike'); // Assurez-vous que le chemin est correct

/**
 * @route   POST /api/hike
 * @desc    Créer une nouvelle randonnée
 * @access  Public (Idéalement, devrait être privé après authentification)
 */
router.post('/', async (req, res) => {
  try {
    // Idéalement, l'userId devrait provenir d'un middleware d'authentification
    // Crée une nouvelle instance de Hike avec toutes les données fournies
    const hike = new Hike({ ...req.body });

    await hike.save();
    res.status(201).send(hike);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Erreur de validation.', error: error.message });
    }
    res.status(500).send({ message: 'Erreur lors de la création de la randonnée.', error: error.message });
  }
});

/**
 * @route   GET /api/hike
 * @desc    Récupérer toutes les randonnées d'un utilisateur
 * @access  Public (Idéalement, filtrer par l'userId de l'utilisateur authentifié)
 */
router.get('/', async (req, res) => {
  try {
    // Pour l'instant, récupère toutes les randonnées.
    // Idéalement, vous filtreriez par userId : const hikes = await Hike.find({ userId: req.user.id });
    const hikes = await Hike.find().sort({ createdAt: -1 });
    res.send(hikes);
  } catch (error) {
    res.status(500).send({ message: 'Erreur lors de la récupération des randonnées.', error: error.message });
  }
});

/**
 * @route   GET /api/hike/:id
 * @desc    Récupérer une randonnée par son ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const hike = await Hike.findById(req.params.id);

    if (!hike) {
      return res.status(404).send({ message: 'Randonnée non trouvée.' });
    }

    res.send(hike);
  } catch (error) {
    // Gère les erreurs comme un ID mal formé
    res.status(500).send({ message: 'Erreur lors de la récupération de la randonnée.', error: error.message });
  }
});

/**
 * @route   PUT /api/hike/:id
 * @desc    Mettre à jour une randonnée
 * @access  Public (Idéalement, vérifier que l'utilisateur est le propriétaire de la randonnée)
 */
router.put('/:id', async (req, res) => {
  try {
    // Crée un objet avec uniquement les champs autorisés à être mis à jour
    const allowedUpdates = [
      'name', 'description', 'startLocation', 'distance', 'duration',
      'elevationGain', 'difficulty', 'photos', 'userTrack', 'dogTrack'
    ];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const hike = await Hike.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true } // `new: true` retourne le document mis à jour
    );

    if (!hike) {
      return res.status(404).send({ message: 'Randonnée non trouvée.' });
    }

    res.send(hike);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Erreur de validation lors de la mise à jour.', error: error.message });
    }
    res.status(500).send({ message: 'Erreur lors de la mise à jour de la randonnée.', error: error.message });
  }
});

/**
 * @route   DELETE /api/hike/:id
 * @desc    Supprimer une randonnée
 * @access  Public (Idéalement, vérifier que l'utilisateur est le propriétaire)
 */
router.delete('/:id', async (req, res) => {
  try {
    const hike = await Hike.findByIdAndDelete(req.params.id);

    if (!hike) {
      return res.status(404).send({ message: 'Randonnée non trouvée.' });
    }

    res.send({ message: 'Randonnée supprimée avec succès.' });
  } catch (error) {
    res.status(500).send({ message: 'Erreur lors de la suppression de la randonnée.', error: error.message });
  }
});

module.exports = router;