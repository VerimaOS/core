'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  DocumentCheckIcon,
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { ipfsService, type ProductData } from '@/lib/verima'

const demoProduct: ProductData = {
  name: 'Sustainable Cotton T-Shirt',
  description: 'Eco-friendly cotton t-shirt made with sustainable practices',
  manufacturer: 'EcoFashion Inc.',
  carbonFootprint: 2.5,
  certifications: ['Organic', 'Fair Trade', 'Carbon Neutral'],
  manufacturingDate: '2024-03-15',
  additionalData: {
    verificationCount: 5,
    lastVerified: '2024-05-16',
  }
}

// ... rest of the existing code ... 