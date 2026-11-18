import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Calendar, 
  Award, 
  Sparkles, 
  Table as TableIcon, 
  LayoutGrid, 
  Lock, 
  Info, 
  X,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServerUrl } from '../utils/urlHelper';

/**
 * Parses raw HTML table content saved in PageContent ('archives')
 * into structured year/volume/issue data.
 */
function parseArchivesHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return null;

  const rows = rawHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  if (rows.length < 2) return null;

  const cleanText = (s) => {
    if (!s) return '';
    return s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const parseCell = (td) => {
    if (!td) return null;
    const linkMatch = td.match(/href=[\"'](.*?)[\"']/i);
    const link = linkMatch ? linkMatch[1] : null;
    const text = cleanText(td);
    if (!text && !link) return null;
    return { text, link };
  };

  const records = [];

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const tr = rows[i];
    const cells = tr.match(/<td[\s\S]*?<\/td>/gi) || [];
    if (cells.length < 2) continue;

    const sno = cleanText(cells[0]) || String(i);
    const year = cleanText(cells[1]) || '';
    if (!year || isNaN(parseInt(year, 10))) continue;

    const issue1 = parseCell(cells[2]);
    const issue2 = parseCell(cells[3]);
    const issue3 = parseCell(cells[4]);
    const issue4 = parseCell(cells[5]);
    const special = parseCell(cells[6]);

    // Extract volume number if present
    const allTexts = [issue1?.text, issue2?.text, issue3?.text, issue4?.text, special?.text].filter(Boolean).join(' ');
    const volMatch = allTexts.match(/Volume\s*(\d+)/i) || allTexts.match(/Vol\.?\s*(\d+)/i);
    const volumeNumber = volMatch ? volMatch[1] : null;

    records.push({
      sno,
      year,
      volume: volumeNumber ? `Vol. ${volumeNumber}` : `Volume for ${year}`,
      volumeNumber: volumeNumber ? parseInt(volumeNumber, 10) : 0,
      issue1: issue1?.text ? issue1 : null,
      issue2: issue2?.text ? issue2 : null,
      issue3: issue3?.text ? issue3 : null,
      issue4: issue4?.text ? issue4 : null,
      special: special?.text ? special : null,
    });
  }

  return records.length > 0 ? records : null;
}

const ArchivesView = ({ page }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isLoggedIn = !!(localStorage.getItem('userToken') || localStorage.getItem('memberToken'));

  // Parse HTML table content from page
  const parsedData = useMemo(() => {
    return parseArchivesHtml(page?.content);
  }, [page?.content]);

  // Handle PDF link clicks with authentication check
  const handlePdfClick = (e, rawUrl) => {
    e.preventDefault();
    e.stopPropagation();

    if (!rawUrl || rawUrl === '#' || rawUrl.startsWith('javascript:')) return;

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const fullUrl = getServerUrl(rawUrl);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtered archives based on search and selected year
  const filteredData = useMemo(() => {
    if (!parsedData) return [];

    return parsedData.filter((item) => {
      // Year filter
      if (selectedYear !== 'ALL' && item.year !== selectedYear) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const yearMatches = item.year.includes(query);
        const volumeMatches = item.volume.toLowerCase().includes(query);
        const issuesMatch = [
          item.issue1?.text,
          item.issue2?.text,
          item.issue3?.text,
          item.issue4?.text,
          item.special?.text,
        ].some((t) => t && t.toLowerCase().includes(query));

        return yearMatches || volumeMatches || issuesMatch;
      }

      return true;
    });
  }, [parsedData, selectedYear, searchTerm]);

  // Extract unique available years for filter pills
  const availableYears = useMemo(() => {
    if (!parsedData) return [];
    return [...new Set(parsedData.map((d) => d.year))].sort((a, b) => b.localeCompare(a));
  }, [parsedData]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!parsedData) return { totalYears: 0, totalIssuesWithPdf: 0, totalIssuesListed: 0 };
    let pdfCount = 0;
    let totalCount = 0;

    parsedData.forEach((row) => {
      [row.issue1, row.issue2, row.issue3, row.issue4, row.special].forEach((issue) => {
        if (issue && issue.text) {
          totalCount++;
          if (issue.link) pdfCount++;
        }
      });
    });

    return {
      totalYears: parsedData.length,
      totalIssuesWithPdf: pdfCount,
      totalIssuesListed: totalCount,
    };
  }, [parsedData]);

  // Helper to render an individual issue badge/card
  const renderIssueCell = (issue, fallbackLabel, isSpecial = false) => {
    if (!issue || !issue.text) {
      return (
        <div className="flex items-center justify-center py-4 text-gray-300 select-none">
          <span className="text-sm">—</span>
        </div>
      );
    }

    const hasLink = Boolean(issue.link);

    if (hasLink) {
      return (
        <div
          onClick={(e) => handlePdfClick(e, issue.link)}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
            isSpecial
              ? 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-200/90 hover:border-amber-300'
              : 'bg-gradient-to-br from-[#f0fdf4] to-emerald-50/70 border-emerald-200/80 hover:border-emerald-300'
          }`}
          title="Click to read or download full PDF"
        >
          <div className="flex items-start gap-2 mb-1.5">
            {isSpecial ? (
              <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <FileText size={14} className="text-[#064e3b] shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-bold text-[#064e3b] group-hover:text-[#04392b] leading-snug line-clamp-2">
              {issue.text}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isSpecial
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100/80 text-emerald-800'
              }`}
            >
              <FileDown size={11} /> Read PDF
            </span>
            <ExternalLink size={12} className="text-[#064e3b]/40 group-hover:text-[#064e3b] transition-colors" />
          </div>
        </div>
      );
    }

    // Has issue title but pending PDF link
    return (
      <div
        className={`p-3.5 rounded-2xl border transition-all duration-200 ${
          isSpecial
            ? 'bg-amber-50/40 border-amber-200/50 text-amber-900'
            : 'bg-gray-50/80 border-gray-200/70 text-gray-700'
        }`}
      >
        <div className="flex items-start gap-2 mb-1">
          {isSpecial ? (
            <Sparkles size={13} className="text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <BookOpen size={13} className="text-gray-400 shrink-0 mt-0.5" />
          )}
          <p className="text-xs font-medium text-gray-700 leading-snug line-clamp-2">
            {issue.text}
          </p>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            {isSpecial ? 'Special Edition' : 'Print Archive'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fff9f0] min-h-screen py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumbs & Header Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#064e3b]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#b47c1c]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b47c1c] uppercase tracking-widest">
              <Link to="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Journal</span>
              <span>/</span>
              <span className="text-[#064e3b]">Past Archives</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-[#064e3b]/5 border border-[#064e3b]/10 text-[#064e3b] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                  <Award size={14} className="text-[#b47c1c]" /> Journal of Oilseeds Research (ISSN: 0970-2776)
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b] tracking-tight leading-tight">
                  Journal Archives
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Browse past volumes, research articles, peer-reviewed quarterly issues, and special editions published from 2013 to present.
                </p>
              </div>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 self-start md:self-auto">
                <div className="bg-[#fff9f0] border border-[#b47c1c]/20 rounded-2xl px-4 py-2.5 text-center shadow-xs">
                  <span className="block text-xs font-bold text-[#b47c1c] uppercase tracking-wider">Archive Span</span>
                  <span className="text-base font-serif font-bold text-[#064e3b]">{stats.totalYears} Years (2013–2026)</span>
                </div>
                <div className="bg-[#f0fdf4] border border-[#064e3b]/15 rounded-2xl px-4 py-2.5 text-center shadow-xs">
                  <span className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider">Indexed Issues</span>
                  <span className="text-base font-serif font-bold text-[#064e3b]">{stats.totalIssuesListed} Issues</span>
                </div>
              </div>
            </div>

            {/* Member Notice */}
            <div className="flex items-center gap-3 bg-[#064e3b]/5 border border-[#064e3b]/10 rounded-2xl p-4 text-xs text-[#064e3b] mt-4 font-medium">
              <Info size={16} className="text-[#b47c1c] shrink-0" />
              <span>
                <strong>Member Access:</strong> Click on any available volume/issue to read or download the complete PDF manuscript. Registered members enjoy unlimited access to full-text papers.
              </span>
            </div>
          </div>
        </div>

        {/* Search, Filter, and View Controls */}
        <div className="bg-white rounded-3xl p-6 border border-[#064e3b]/10 shadow-lg space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by year (e.g. 2024), volume, or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-10 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#064e3b]'
                }`}
              >
                <TableIcon size={14} /> Table View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#064e3b]'
                }`}
              >
                <LayoutGrid size={14} /> Cards View
              </button>
            </div>
          </div>

          {/* Year Filter Pills */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-[#b47c1c]" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Filter by Publication Year:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setSelectedYear('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === 'ALL'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Years ({parsedData?.length || 0})
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-[#b47c1c] text-white shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {!parsedData ? (
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5">
            <div 
              className="prose prose-lg max-w-none prose-slate"
              dangerouslySetInnerHTML={{ __html: page?.content || '' }} 
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-[#064e3b]/10 shadow-lg space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#064e3b]">No Archive Issues Found</h3>
            <p className="text-gray-500 text-xs max-w-md mx-auto">
              We couldn't find any journal volumes matching "{searchTerm}". Try clearing your search query or selecting a different year.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('ALL');
              }}
              className="inline-flex items-center gap-2 bg-[#064e3b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#04392b] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ========================================================
             MODERN TABLE VIEW
             ======================================================== */
          <div className="bg-white rounded-[2.5rem] border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[950px]">
                <thead>
                  <tr className="bg-[#064e3b] text-white border-b-2 border-[#b47c1c]">
                    <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-center w-24">
                      Year / Vol
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider w-[18%]">
                      Issue-I (March)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider w-[18%]">
                      Issue-II (June)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider w-[18%]">
                      Issue-III (Sept)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider w-[18%]">
                      Issue-IV (Dec)
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider w-[20%] text-amber-200">
                      ⭐ Special Edition
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((row, idx) => (
                    <tr
                      key={row.year}
                      className={`hover:bg-[#f0fdf4]/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fffdfa]'
                      }`}
                    >
                      {/* Year & Volume Column */}
                      <td className="py-5 px-4 text-center align-top border-r border-gray-100">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-serif font-bold text-[#064e3b] leading-tight">
                            {row.year}
                          </span>
                          <span className="text-[10px] font-bold text-[#b47c1c] bg-[#b47c1c]/10 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                            {row.volume}
                          </span>
                        </div>
                      </td>

                      {/* Issue 1 */}
                      <td className="p-3 align-top">
                        {renderIssueCell(row.issue1, 'Issue-1')}
                      </td>

                      {/* Issue 2 */}
                      <td className="p-3 align-top">
                        {renderIssueCell(row.issue2, 'Issue-2')}
                      </td>

                      {/* Issue 3 */}
                      <td className="p-3 align-top">
                        {renderIssueCell(row.issue3, 'Issue-3')}
                      </td>

                      {/* Issue 4 */}
                      <td className="p-3 align-top">
                        {renderIssueCell(row.issue4, 'Issue-4')}
                      </td>

                      {/* Special Issue */}
                      <td className="p-3 align-top bg-amber-50/20">
                        {renderIssueCell(row.special, 'Special Issue', true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ========================================================
             CARDS / GRID VIEW
             ======================================================== */
          <div className="space-y-6">
            {filteredData.map((row) => (
              <div
                key={row.year}
                className="bg-white rounded-[2rem] border border-[#064e3b]/10 shadow-xl overflow-hidden hover:border-[#064e3b]/30 transition-all"
              >
                {/* Year Header Banner */}
                <div className="bg-gradient-to-r from-[#064e3b] to-[#0b5c47] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#b47c1c]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-serif font-bold tracking-tight">{row.year}</span>
                    <span className="text-xs font-bold text-[#fbbf24] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                      {row.volume}
                    </span>
                  </div>
                  <div className="text-xs text-white/80 font-medium">
                    Published Volume Archives
                  </div>
                </div>

                {/* Issues Grid */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Issue-I (March)
                    </span>
                    {renderIssueCell(row.issue1, 'Issue-1')}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Issue-II (June)
                    </span>
                    {renderIssueCell(row.issue2, 'Issue-2')}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Issue-III (Sept)
                    </span>
                    {renderIssueCell(row.issue3, 'Issue-3')}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Issue-IV (Dec)
                    </span>
                    {renderIssueCell(row.issue4, 'Issue-4')}
                  </div>

                  {row.special && (
                    <div className="sm:col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                        ⭐ Special Issue
                      </span>
                      {renderIssueCell(row.special, 'Special Issue', true)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Page PDF Attachments (if any attached via admin) */}
        {page.pdfs && page.pdfs.length > 0 && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#064e3b]/10 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#064e3b]">Supplementary Downloads</h3>
                <p className="text-xs text-gray-500">Additional documents and journal indexes attached to this archive.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.pdfs.map((pdf, idx) => {
                const pdfUrl = getServerUrl(pdf.url || pdf);
                const displayName = (pdf.filename || pdf.name || (typeof pdf === 'string' ? pdf : pdf.url || '').split('/').pop() || `Document ${idx + 1}.pdf`)
                  .replace(/^\d+-/, '')
                  .replace(/_/g, ' ');

                return (
                  <div
                    key={idx}
                    onClick={(e) => handlePdfClick(e, pdfUrl)}
                    className="flex items-center gap-4 p-4 bg-[#f0fdf4] border border-[#064e3b]/10 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-[#064e3b] rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-[#064e3b] truncate group-hover:text-[#1e703c]">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click to view/download PDF</p>
                    </div>
                    <ExternalLink size={16} className="text-[#064e3b]/40 group-hover:text-[#064e3b] transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-[#064e3b]/10 space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center mx-auto">
                <Lock size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-[#064e3b]">Member Login Required</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Full-text PDF manuscripts and archives are restricted to active members and registered subscribers of the Indian Society of Oilseeds Research.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => navigate('/user/login')}
                  className="w-full bg-[#064e3b] hover:bg-[#04392b] text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-[#064e3b]/20 transition-all flex items-center justify-center gap-2"
                >
                  Login to Access PDFs
                </button>
                <button
                  onClick={() => navigate('/membership')}
                  className="w-full bg-[#b47c1c]/10 hover:bg-[#b47c1c]/20 text-[#b47c1c] border border-[#b47c1c]/30 py-3 rounded-2xl font-bold text-xs transition-all"
                >
                  Join ISOR / Apply for Membership
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArchivesView;
